from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.utils.security import get_current_user
from app.utils.exceptions import raise_forbidden

def get_current_user_required(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that ensures user is authenticated"""
    return current_user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that ensures user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise_forbidden("Only administrators can perform this action")
    return current_user

def get_reviewer_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that ensures user is a reviewer or admin"""
    if current_user.role not in [UserRole.REVIEWER, UserRole.ADMIN]:
        raise_forbidden("Only reviewers and administrators can perform this action")
    return current_user

def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that gets a user by ID with permission checks"""
    from app.utils.exceptions import raise_not_found
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE and current_user.id != user_id:
        raise_forbidden("You can only access your own profile")
    
    # Get user
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise_not_found("User not found")
    
    return user

def get_db_session() -> Session:
    """Dependency that provides database session"""
    return next(get_db()) 