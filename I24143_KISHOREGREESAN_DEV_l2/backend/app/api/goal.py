from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalProgressUpdate, GoalProgressHistoryResponse
from app.models.goal import Goal, GoalStatus, GoalProgressHistory
from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services.notification_service import NotificationService
from typing import List
from datetime import datetime
from app.schemas.goal import GoalReviewRequest

router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_goal = Goal(
        user_id=current_user.id,
        title=goal.title,
        description=goal.description,
        target=goal.target,
        quarter=goal.quarter,
        start_date=goal.start_date,
        end_date=goal.end_date,
        status=GoalStatus.draft,
        comments=goal.comments,
        reviewer_id=goal.reviewer_id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/review", response_model=List[GoalResponse])
def list_goals_for_review(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only reviewers and admins can access
    if current_user.role not in ["reviewer", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get goals with user information
    if current_user.role == "admin":
        # Admin can see all submitted goals
        goals = db.query(Goal).filter(Goal.status == GoalStatus.submitted).all()
    else:
        # Reviewers can only see goals assigned to them
        goals = db.query(Goal).filter(Goal.reviewer_id == current_user.id, Goal.status == GoalStatus.submitted).all()
    
    # Add user information to each goal
    for goal in goals:
        goal.user = db.query(User).filter(User.id == goal.user_id).first()
    
    return goals

@router.post("/{goal_id}/review", response_model=GoalResponse)
def review_goal(goal_id: int, review_request: GoalReviewRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only reviewers and admins can review
    if current_user.role not in ["reviewer", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find the goal
    if current_user.role == "admin":
        # Admin can review any submitted goal
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.status == GoalStatus.submitted).first()
    else:
        # Reviewers can only review goals assigned to them
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.reviewer_id == current_user.id, Goal.status == GoalStatus.submitted).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found or not assigned to you")
    
    notification_service = NotificationService(db)
    
    if review_request.action == "approve":
        goal.status = GoalStatus.approved
    elif review_request.action == "reject":
        goal.status = GoalStatus.rejected
    elif review_request.action == "return":
        goal.status = GoalStatus.draft
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if review_request.feedback:
        goal.comments = (goal.comments or "") + f"\n[Reviewer]: {review_request.feedback}"
    
    # Create notification for the employee
    notification_service.notify_goal_reviewed(goal, current_user, review_request.action)
    
    db.commit()
    db.refresh(goal)
    return goal

# Update submit_all_draft_goals to assign reviewer_id (manager_id)
@router.post("/submit_all", status_code=200)
def submit_all_draft_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    draft_goals = db.query(Goal).filter(Goal.user_id == current_user.id, Goal.status == GoalStatus.draft).all()
    
    if not draft_goals:
        raise HTTPException(status_code=400, detail="No draft goals available to submit for review")
    
    # Check if user has a manager/reviewer assigned
    if not current_user.manager_id and not current_user.appraiser_id:
        raise HTTPException(
            status_code=400, 
            detail="Cannot submit goals for review. No reviewer has been assigned to you. Please contact your administrator."
        )
    
    notification_service = NotificationService(db)
    
    for goal in draft_goals:
        goal.status = GoalStatus.submitted
        # Assign reviewer_id to manager_id if present, otherwise use appraiser_id
        if current_user.manager_id:
            goal.reviewer_id = current_user.manager_id
        elif current_user.appraiser_id:
            goal.reviewer_id = current_user.appraiser_id
        
        # Create notification for the reviewer
        if goal.reviewer_id:
            notification_service.notify_goal_submitted(goal, current_user)
    
    db.commit()
    return {"updated": len(draft_goals)}

@router.get("/", response_model=List[GoalResponse])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.get("/all", response_model=List[GoalResponse])
def list_all_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all goals for managers/reviewers to see their team's goals"""
    if current_user.role == "admin":
        # Admin can see all goals
        return db.query(Goal).all()
    elif current_user.role == "reviewer":
        # Reviewer can see goals of employees under their management
        from app.models.user import UserRole
        team_employee_ids = db.query(User.id).filter(
            User.manager_id == current_user.id,
            User.role == UserRole.EMPLOYEE
        ).all()
        employee_ids = [emp[0] for emp in team_employee_ids]
        return db.query(Goal).filter(Goal.user_id.in_(employee_ids)).all()
    else:
        # Employees can only see their own goals
        return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal_update: GoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    for field, value in goal_update.dict(exclude_unset=True).items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None

# Progress tracking endpoints
@router.post("/{goal_id}/progress", response_model=GoalResponse)
def update_goal_progress(goal_id: int, progress_update: GoalProgressUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Validate progress value
    if progress_update.progress < 0 or progress_update.progress > 100:
        raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
    
    # Create progress history entry
    progress_history = GoalProgressHistory(
        goal_id=goal_id,
        user_id=current_user.id,
        progress=progress_update.progress,
        comments=progress_update.comments
    )
    db.add(progress_history)
    
    # Update goal progress
    goal.progress = progress_update.progress
    goal.progress_updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/{goal_id}/progress", response_model=List[GoalProgressHistoryResponse])
def get_goal_progress_history(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    progress_history = db.query(GoalProgressHistory).filter(
        GoalProgressHistory.goal_id == goal_id
    ).order_by(GoalProgressHistory.created_at.desc()).all()
    
    return progress_history 