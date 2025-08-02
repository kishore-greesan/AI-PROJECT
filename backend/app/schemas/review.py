from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ReviewType(str, Enum):
    self_assessment = "self_assessment"
    manager_review = "manager_review"

class ReviewBase(BaseModel):
    goal_id: int = Field(..., description="ID of the goal being reviewed")
    quarter: str = Field(..., description="Quarter for the review (e.g., 'Q1 2024')")
    rating: int = Field(..., ge=1, le=5, description="Rating on a scale of 1-5")
    comments: Optional[str] = Field(None, description="General comments about performance")
    strengths: Optional[str] = Field(None, description="Areas of strength")
    areas_for_improvement: Optional[str] = Field(None, description="Areas for improvement")

class ReviewCreate(ReviewBase):
    review_type: ReviewType = Field(..., description="Type of review (self-assessment or manager review)")

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating on a scale of 1-5")
    comments: Optional[str] = Field(None, description="General comments about performance")
    strengths: Optional[str] = Field(None, description="Areas of strength")
    areas_for_improvement: Optional[str] = Field(None, description="Areas for improvement")

class ReviewResponse(ReviewBase):
    id: int
    reviewer_id: int
    review_type: ReviewType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReviewComparison(BaseModel):
    goal_id: int
    goal_title: str
    quarter: str
    self_assessment: Optional[ReviewResponse] = None
    manager_review: Optional[ReviewResponse] = None
    rating_difference: Optional[int] = None  # manager_rating - self_rating

class ReviewSummary(BaseModel):
    total_reviews: int
    average_rating: float
    reviews_by_type: dict
    recent_reviews: List[ReviewResponse] 