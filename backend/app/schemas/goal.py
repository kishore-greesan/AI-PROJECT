from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from decimal import Decimal
from app.schemas.user import UserResponse

class GoalStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"

class GoalBase(BaseModel):
    title: str = Field(..., description="Goal title is required")
    description: str = Field(..., description="Goal description is required")
    target: str = Field(..., description="Goal target is required")
    quarter: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    comments: Optional[str] = None
    reviewer_id: Optional[int] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    status: Optional[GoalStatus] = None

class GoalProgressUpdate(BaseModel):
    progress: Decimal = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    comments: Optional[str] = Field(None, description="Progress update comments")

class GoalReviewRequest(BaseModel):
    action: str = Field(..., description="Review action: approve, reject, or return")
    feedback: Optional[str] = Field("", description="Review feedback comments")

class GoalProgressHistoryResponse(BaseModel):
    id: int
    goal_id: int
    user_id: int
    progress: Decimal
    comments: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class GoalResponse(GoalBase):
    id: int
    user_id: int
    status: GoalStatus
    progress: Optional[Decimal] = 0.00
    progress_updated_at: Optional[datetime]
    progress_history: Optional[List[GoalProgressHistoryResponse]] = []
    user: Optional[UserResponse] = None

    class Config:
        orm_mode = True 