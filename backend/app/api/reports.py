from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, UserRole
from app.models.goal import Goal, GoalStatus, GoalProgressHistory
from app.models.review import Review, ReviewType
from app.models.skill import Skill, SkillCategory, CompetencyLevel
from app.models.notification import Notification, NotificationType
from app.utils.security import get_current_user
from decimal import Decimal

router = APIRouter()

@router.get("/admin/overview")
async def get_admin_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get admin overview statistics"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(User.role).all()
    
    # Goals by status
    goals_by_status = db.query(
        Goal.status,
        func.count(Goal.id).label('count')
    ).group_by(Goal.status).all()
    
    # Average goal progress
    avg_progress = db.query(func.avg(Goal.progress)).scalar() or 0
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_registrations = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar()
    
    # Skills distribution by category
    skills_by_category = db.query(
        Skill.category,
        func.count(Skill.id).label('count')
    ).group_by(Skill.category).all()
    
    # Reviews by rating
    reviews_by_rating = db.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).group_by(Review.rating).order_by(Review.rating).all()
    
    return {
        "users_by_role": [{"role": role, "count": count} for role, count in users_by_role],
        "goals_by_status": [{"status": status, "count": count} for status, count in goals_by_status],
        "average_goal_progress": float(avg_progress),
        "recent_registrations": recent_registrations,
        "skills_by_category": [{"category": category, "count": count} for category, count in skills_by_category],
        "reviews_by_rating": [{"rating": rating, "count": count} for rating, count in reviews_by_rating]
    }

@router.get("/admin/department-stats")
async def get_department_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get department-wise statistics for admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Users by department
    users_by_dept = db.query(
        User.department,
        func.count(User.id).label('count')
    ).filter(User.department.isnot(None)).group_by(User.department).all()
    
    # Average goal progress by department
    dept_progress = db.query(
        User.department,
        func.avg(Goal.progress).label('avg_progress')
    ).join(Goal, User.id == Goal.user_id).filter(
        User.department.isnot(None)
    ).group_by(User.department).all()
    
    # Skills by department
    dept_skills = db.query(
        User.department,
        func.count(Skill.id).label('skill_count')
    ).join(Skill, User.id == Skill.user_id).filter(
        User.department.isnot(None)
    ).group_by(User.department).all()
    
    return {
        "users_by_department": [{"department": dept, "count": count} for dept, count in users_by_dept],
        "progress_by_department": [{"department": dept, "avg_progress": float(avg)} for dept, avg in dept_progress],
        "skills_by_department": [{"department": dept, "skill_count": count} for dept, count in dept_skills]
    }

@router.get("/manager/team-overview")
async def get_manager_team_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get manager's team overview statistics"""
    if current_user.role != UserRole.REVIEWER:
        raise HTTPException(status_code=403, detail="Manager access required")
    
    # Get team members (users managed by this manager)
    team_members = db.query(User).filter(
        User.manager_id == current_user.id
    ).all()
    
    team_member_ids = [member.id for member in team_members]
    
    # Team goals by status
    team_goals_by_status = db.query(
        Goal.status,
        func.count(Goal.id).label('count')
    ).filter(Goal.user_id.in_(team_member_ids)).group_by(Goal.status).all()
    
    # Average team progress
    team_avg_progress = db.query(func.avg(Goal.progress)).filter(
        Goal.user_id.in_(team_member_ids)
    ).scalar() or 0
    
    # Team skills distribution
    team_skills_by_level = db.query(
        Skill.competency_level,
        func.count(Skill.id).label('count')
    ).filter(Skill.user_id.in_(team_member_ids)).group_by(Skill.competency_level).all()
    
    # Team reviews by rating
    team_reviews_by_rating = db.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).filter(
        Review.reviewer_id == current_user.id,
        Review.review_type == ReviewType.manager_review
    ).group_by(Review.rating).order_by(Review.rating).all()
    
    return {
        "team_size": len(team_members),
        "team_goals_by_status": [{"status": status, "count": count} for status, count in team_goals_by_status],
        "team_average_progress": float(team_avg_progress),
        "team_skills_by_level": [{"level": level, "count": count} for level, count in team_skills_by_level],
        "team_reviews_by_rating": [{"rating": rating, "count": count} for rating, count in team_reviews_by_rating]
    }

@router.get("/manager/team-members")
async def get_team_members_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed team member statistics for manager"""
    if current_user.role != UserRole.REVIEWER:
        raise HTTPException(status_code=403, detail="Manager access required")
    
    # Get team members with their stats
    team_members = db.query(User).filter(
        User.manager_id == current_user.id
    ).all()
    
    team_details = []
    for member in team_members:
        # Member's goals
        member_goals = db.query(Goal).filter(Goal.user_id == member.id).all()
        goal_count = len(member_goals)
        avg_progress = sum([float(goal.progress) for goal in member_goals]) / goal_count if goal_count > 0 else 0
        
        # Member's skills
        member_skills = db.query(Skill).filter(Skill.user_id == member.id).all()
        skill_count = len(member_skills)
        
        # Member's reviews (manager reviews)
        member_reviews = db.query(Review).filter(
            Review.reviewer_id == current_user.id,
            Review.review_type == ReviewType.manager_review,
            Review.goal_id.in_([goal.id for goal in member_goals])
        ).all()
        avg_rating = sum([review.rating for review in member_reviews]) / len(member_reviews) if member_reviews else 0
        
        team_details.append({
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "department": member.department,
            "goal_count": goal_count,
            "average_progress": avg_progress,
            "skill_count": skill_count,
            "average_rating": avg_rating
        })
    
    return {"team_members": team_details}

@router.get("/trends/goal-progress")
async def get_goal_progress_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get goal progress trends over time"""
    if current_user.role not in [UserRole.ADMIN, UserRole.REVIEWER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get progress history for the specified period
        start_date = datetime.now() - timedelta(days=days)
        
        if current_user.role == UserRole.ADMIN:
            # Admin sees all progress
            progress_data = db.query(
                func.date(GoalProgressHistory.created_at).label('date'),
                func.avg(GoalProgressHistory.progress).label('avg_progress')
            ).filter(
                GoalProgressHistory.created_at >= start_date
            ).group_by(func.date(GoalProgressHistory.created_at)).order_by(
                func.date(GoalProgressHistory.created_at)
            ).all()
        else:
            # Manager sees only team progress
            team_member_ids = [user.id for user in db.query(User).filter(User.manager_id == current_user.id).all()]
            progress_data = db.query(
                func.date(GoalProgressHistory.created_at).label('date'),
                func.avg(GoalProgressHistory.progress).label('avg_progress')
            ).filter(
                GoalProgressHistory.created_at >= start_date,
                GoalProgressHistory.user_id.in_(team_member_ids)
            ).group_by(func.date(GoalProgressHistory.created_at)).order_by(
                func.date(GoalProgressHistory.created_at)
            ).all()
        
        return {
            "trend_data": [
                {"date": str(date), "avg_progress": float(avg_progress)} 
                for date, avg_progress in progress_data
            ]
        }
    except Exception as e:
        # Return empty data if there's an error (e.g., no progress history)
        return {
            "trend_data": []
        }

@router.get("/skills/competency-matrix")
async def get_skills_competency_matrix(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skills competency matrix"""
    if current_user.role not in [UserRole.ADMIN, UserRole.REVIEWER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user.role == UserRole.ADMIN:
        # Admin sees all skills
        skills_data = db.query(
            Skill.category,
            Skill.competency_level,
            func.count(Skill.id).label('count')
        ).group_by(Skill.category, Skill.competency_level).all()
    else:
        # Manager sees only team skills
        team_member_ids = [user.id for user in db.query(User).filter(User.manager_id == current_user.id).all()]
        skills_data = db.query(
            Skill.category,
            Skill.competency_level,
            func.count(Skill.id).label('count')
        ).filter(Skill.user_id.in_(team_member_ids)).group_by(Skill.category, Skill.competency_level).all()
    
    # Organize data by category and level
    matrix = {}
    for category, level, count in skills_data:
        if category not in matrix:
            matrix[category] = {}
        matrix[category][level] = count
    
    return {"competency_matrix": matrix} 