from sqlalchemy.orm import Session
from app.models.user import User, UserRole, ApprovalStatus
from app.schemas.user import UserCreate, UserLogin, Token, UserRegistration
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token
)
from datetime import timedelta, datetime
from typing import Optional
from fastapi import HTTPException, status

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is locked"
            )
        # Check approval status
        if user.approval_status == ApprovalStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is pending approval"
            )
        if user.approval_status == ApprovalStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account registration was rejected"
            )
        return user
    
    def register_user(self, user_data: UserRegistration) -> User:
        """Register a new user (pending approval)."""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user with pending approval
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role,
            department=user_data.department,
            manager_id=user_data.manager_id,
            title=user_data.title,
            phone=user_data.phone,
            approval_status=ApprovalStatus.PENDING,
            is_active=False  # Inactive until approved
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user (Admin only - auto-approved)."""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role,
            department=user_data.department,
            manager_id=user_data.manager_id,
            title=user_data.title,
            phone=user_data.phone,
            approval_status=ApprovalStatus.APPROVED,
            is_active=True
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user
    
    def approve_user(self, user_id: int, admin_user: User, approval_status: ApprovalStatus, reason: Optional[str] = None) -> User:
        """Approve or reject a user registration."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.approval_status != ApprovalStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not pending approval"
            )
        
        user.approval_status = approval_status
        user.approved_by = admin_user.id
        user.approved_at = datetime.now()
        
        if approval_status == ApprovalStatus.APPROVED:
            user.is_active = True
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_pending_registrations(self) -> list[User]:
        """Get all pending user registrations."""
        return self.db.query(User).filter(
            User.approval_status == ApprovalStatus.PENDING
        ).order_by(User.created_at.desc()).all()
    
    def create_tokens(self, user: User) -> Token:
        """Create access and refresh tokens for a user."""
        token_data = {
            "sub": user.email,
            "user_id": user.id,
            "role": user.role.value
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=15 * 60  # 15 minutes in seconds
        )
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user_last_login(self, user: User):
        """Update user's last login timestamp."""
        from datetime import datetime
        user.updated_at = datetime.now()
        self.db.commit() 