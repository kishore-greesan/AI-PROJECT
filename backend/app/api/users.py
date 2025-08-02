from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.models.user import User, UserRole
from app.utils.dependencies import get_current_user_required, get_admin_user, get_reviewer_user, get_user_by_id
from app.utils.exceptions import raise_forbidden, raise_not_found
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user_required)):
    """
    Get current user's profile information.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    """
    print(f"🔍 update_current_user_profile called for user {current_user.id}")
    print(f"🔍 Received update data: {user_update.dict()}")
    
    auth_service = AuthService(db)
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    print(f"🔍 Update data after exclude_unset: {update_data}")
    
    for field, value in update_data.items():
        if value is not None:
            print(f"🔍 Setting {field} = {value}")
            setattr(current_user, field, value)
    
    # Save changes
    db.commit()
    db.refresh(current_user)
    
    print(f"✅ User updated successfully. New manager_id: {current_user.manager_id}, appraiser_id: {current_user.appraiser_id}")
    return current_user

@router.get("/reviewers", response_model=List[UserResponse])
def get_reviewers(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Get list of all reviewers for dropdown selection.
    """
    reviewers = db.query(User).filter(
        User.is_active == True,
        User.role == UserRole.REVIEWER
    ).all()
    return reviewers

@router.get("/employees", response_model=List[UserResponse])
def get_employees_under_manager(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Get list of employees under the current manager/reviewer.
    """
    # If user is admin, return all employees
    if current_user.role == UserRole.ADMIN:
        employees = db.query(User).filter(
            User.is_active == True,
            User.role == UserRole.EMPLOYEE
        ).all()
    else:
        # For reviewers, return employees who have this user as their manager
        employees = db.query(User).filter(
            User.is_active == True,
            User.role == UserRole.EMPLOYEE,
            User.manager_id == current_user.id
        ).all()
    
    return employees

@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user: User = Depends(get_user_by_id)):
    """
    Get user profile by ID (Admin/Reviewer can view team members).
    """
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    user: User = Depends(get_user_by_id),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile (Admin only).
    """
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)
    
    # Save changes
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
def delete_user(
    user: User = Depends(get_user_by_id),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete user (Admin only).
    """
    # Don't allow admin to delete themselves
    if user.id == current_user.id:
        raise raise_forbidden("You cannot delete your own account")
    
    # Soft delete - set is_active to False
    user.is_active = False
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/", response_model=List[UserResponse])
def get_users(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get list of users (Admin only).
    """
    query = db.query(User).filter(User.is_active == True)
    
    users = query.offset(skip).limit(limit).all()
    return users 