from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.models.goal import Goal
from typing import List, Optional
from datetime import datetime

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: NotificationType,
        goal_id: Optional[int] = None,
        sender_id: Optional[int] = None,
        related_user_id: Optional[int] = None
    ) -> Notification:
        """Create a new notification."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            goal_id=goal_id,
            sender_id=sender_id,
            related_user_id=related_user_id
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification
    
    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Get notifications for a user."""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    def mark_notification_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a notification as read."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            self.db.commit()
            self.db.refresh(notification)
        
        return notification
    
    def mark_all_notifications_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user."""
        result = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        
        self.db.commit()
        return result
    
    def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications for a user."""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def notify_goal_submitted(self, goal: Goal, employee: User) -> Notification:
        """Create notification when a goal is submitted for review."""
        if not goal.reviewer_id:
            return None
        
        title = "New Goal Submitted for Review"
        message = f"{employee.name} has submitted goal '{goal.title}' for your review."
        
        return self.create_notification(
            user_id=goal.reviewer_id,
            title=title,
            message=message,
            notification_type=NotificationType.GOAL_SUBMITTED,
            goal_id=goal.id,
            sender_id=employee.id
        )
    
    def notify_goal_reviewed(self, goal: Goal, reviewer: User, action: str) -> Notification:
        """Create notification when a goal is reviewed."""
        title_map = {
            "approve": "Goal Approved",
            "reject": "Goal Rejected", 
            "return": "Goal Returned for Revision"
        }
        
        message_map = {
            "approve": f"Your goal '{goal.title}' has been approved by {reviewer.name}.",
            "reject": f"Your goal '{goal.title}' has been rejected by {reviewer.name}.",
            "return": f"Your goal '{goal.title}' has been returned for revision by {reviewer.name}."
        }
        
        type_map = {
            "approve": NotificationType.GOAL_APPROVED,
            "reject": NotificationType.GOAL_REJECTED,
            "return": NotificationType.GOAL_RETURNED
        }
        
        return self.create_notification(
            user_id=goal.user_id,
            title=title_map.get(action, "Goal Review Update"),
            message=message_map.get(action, f"Your goal '{goal.title}' has been reviewed."),
            notification_type=type_map.get(action, NotificationType.SYSTEM_MESSAGE),
            goal_id=goal.id,
            sender_id=reviewer.id
        ) 