from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, UserRole
from app.models.goal import Goal
from app.models.review import Review, ReviewType
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewResponse, 
    ReviewComparison, ReviewSummary
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewResponse)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new review (self-assessment or manager review)"""
    
    # Verify the goal exists and user has access
    goal = db.query(Goal).filter(Goal.id == review_data.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # For self-assessment, user must own the goal
    if review_data.review_type == ReviewType.self_assessment:
        if goal.user_id != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="You can only create self-assessments for your own goals"
            )
    # For manager review, user must be a reviewer or admin
    elif review_data.review_type == ReviewType.manager_review:
        if current_user.role not in [UserRole.reviewer, UserRole.admin]:
            raise HTTPException(
                status_code=403, 
                detail="Only reviewers and admins can create manager reviews"
            )
    
    # Check if review already exists for this goal, quarter, and type
    existing_review = db.query(Review).filter(
        Review.goal_id == review_data.goal_id,
        Review.quarter == review_data.quarter,
        Review.review_type == review_data.review_type
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=400, 
            detail=f"A {review_data.review_type.value} already exists for this goal and quarter"
        )
    
    # Create the review
    review = Review(
        goal_id=review_data.goal_id,
        reviewer_id=current_user.id,
        review_type=review_data.review_type,
        quarter=review_data.quarter,
        rating=review_data.rating,
        comments=review_data.comments,
        strengths=review_data.strengths,
        areas_for_improvement=review_data.areas_for_improvement
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review

@router.get("/", response_model=List[ReviewResponse])
def list_reviews(
    goal_id: Optional[int] = None,
    review_type: Optional[ReviewType] = None,
    quarter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List reviews with optional filtering"""
    
    query = db.query(Review)
    
    # Apply filters
    if goal_id:
        query = query.filter(Review.goal_id == goal_id)
    if review_type:
        query = query.filter(Review.review_type == review_type)
    if quarter:
        query = query.filter(Review.quarter == quarter)
    
    # Role-based access control
    if current_user.role == UserRole.EMPLOYEE:
        # Employees can only see their own reviews and manager reviews of their goals
        query = query.join(Goal).filter(
            (Review.reviewer_id == current_user.id) |  # Own reviews
            (Goal.user_id == current_user.id)  # Manager reviews of their goals
        )
    elif current_user.role == UserRole.REVIEWER:
        # Reviewers can see reviews of goals they're reviewing
        query = query.join(Goal).filter(
            (Review.reviewer_id == current_user.id) |  # Own reviews
            (Goal.reviewer_id == current_user.id)  # Reviews of goals they're reviewing
        )
    # Admins can see all reviews
    
    return query.order_by(Review.created_at.desc()).all()

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific review by ID"""
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check access permissions
    goal = db.query(Goal).filter(Goal.id == review.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if current_user.role == UserRole.EMPLOYEE:
        if review.reviewer_id != current_user.id and goal.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.REVIEWER:
        if review.reviewer_id != current_user.id and goal.reviewer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return review

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing review"""
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if user can update this review
    if review.reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own reviews")
    
    # Update fields
    update_data = review_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)
    
    review.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(review)
    
    return review

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a review"""
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if user can delete this review
    if review.reviewer_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

@router.get("/comparison/{goal_id}", response_model=List[ReviewComparison])
def get_review_comparison(
    goal_id: int,
    quarter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comparison between self-assessment and manager review for a goal"""
    
    # Verify the goal exists and user has access
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Check access permissions
    if current_user.role == UserRole.employee and goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.reviewer and goal.reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get reviews for this goal
    query = db.query(Review).filter(Review.goal_id == goal_id)
    if quarter:
        query = query.filter(Review.quarter == quarter)
    
    reviews = query.all()
    
    # Group by quarter
    quarters = {}
    for review in reviews:
        if review.quarter not in quarters:
            quarters[review.quarter] = {
                'self_assessment': None,
                'manager_review': None
            }
        quarters[review.quarter][review.review_type.value] = review
    
    # Create comparison objects
    comparisons = []
    for quarter_name, quarter_reviews in quarters.items():
        comparison = ReviewComparison(
            goal_id=goal_id,
            goal_title=goal.title,
            quarter=quarter_name,
            self_assessment=quarter_reviews['self_assessment'],
            manager_review=quarter_reviews['manager_review']
        )
        
        # Calculate rating difference if both reviews exist
        if comparison.self_assessment and comparison.manager_review:
            comparison.rating_difference = (
                comparison.manager_review.rating - comparison.self_assessment.rating
            )
        
        comparisons.append(comparison)
    
    return comparisons

@router.get("/summary/", response_model=ReviewSummary)
def get_review_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary statistics for reviews"""
    
    # Build query based on user role
    query = db.query(Review)
    
    if current_user.role == UserRole.EMPLOYEE:
        # Employees see their own reviews and manager reviews of their goals
        query = query.join(Goal).filter(
            (Review.reviewer_id == current_user.id) |  # Own reviews
            (Goal.user_id == current_user.id)  # Manager reviews of their goals
        )
    elif current_user.role == UserRole.REVIEWER:
        # Reviewers see reviews of goals they're reviewing
        query = query.join(Goal).filter(
            (Review.reviewer_id == current_user.id) |  # Own reviews
            (Goal.reviewer_id == current_user.id)  # Reviews of goals they're reviewing
        )
    # Admins see all reviews
    
    reviews = query.all()
    
    if not reviews:
        return ReviewSummary(
            total_reviews=0,
            average_rating=0.0,
            reviews_by_type={},
            recent_reviews=[]
        )
    
    # Calculate statistics
    total_reviews = len(reviews)
    average_rating = sum(r.rating for r in reviews) / total_reviews
    
    # Group by review type
    reviews_by_type = {}
    for review in reviews:
        review_type = review.review_type.value
        if review_type not in reviews_by_type:
            reviews_by_type[review_type] = 0
        reviews_by_type[review_type] += 1
    
    # Get recent reviews (last 5)
    recent_reviews = sorted(reviews, key=lambda x: x.created_at, reverse=True)[:5]
    
    return ReviewSummary(
        total_reviews=total_reviews,
        average_rating=round(average_rating, 2),
        reviews_by_type=reviews_by_type,
        recent_reviews=recent_reviews
    ) 