from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum, Numeric, DateTime
from app.database import Base
import enum
from datetime import datetime

class GoalStatus(enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target = Column(String(255), nullable=True)
    quarter = Column(String(20), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(GoalStatus), default=GoalStatus.draft, nullable=False)
    comments = Column(Text, nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    progress = Column(Numeric(5, 2), default=0.00, nullable=False)  # 0.00 to 100.00
    progress_updated_at = Column(DateTime, default=datetime.utcnow, nullable=True)

class GoalProgressHistory(Base):
    __tablename__ = "goal_progress_history"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    progress = Column(Numeric(5, 2), nullable=False)  # 0.00 to 100.00
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) 