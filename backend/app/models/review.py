from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum, Numeric, DateTime
from app.database import Base
import enum
from datetime import datetime

class ReviewType(enum.Enum):
    self_assessment = "self_assessment"
    manager_review = "manager_review"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Employee for self-assessment, Manager for manager review
    review_type = Column(Enum(ReviewType), nullable=False)
    quarter = Column(String(20), nullable=False)  # e.g., "Q1 2024", "Q2 2024"
    rating = Column(Integer, nullable=False)  # 1-5 scale
    comments = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) 