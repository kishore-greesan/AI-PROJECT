from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from app.database import Base
import enum
from datetime import datetime

class NotificationType(enum.Enum):
    GOAL_SUBMITTED = "goal_submitted"
    GOAL_APPROVED = "goal_approved"
    GOAL_REJECTED = "goal_rejected"
    GOAL_RETURNED = "goal_returned"
    REVIEW_REQUESTED = "review_requested"
    SYSTEM_MESSAGE = "system_message"
    USER_REGISTRATION = "user_registration"
    USER_APPROVED = "user_approved"
    USER_REJECTED = "user_rejected"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Optional foreign keys for related entities
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    related_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For user approval notifications
    
    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.notification_type}, read={self.is_read})>" 