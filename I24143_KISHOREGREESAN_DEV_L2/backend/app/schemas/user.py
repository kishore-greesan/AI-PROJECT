from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, ApprovalStatus

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = None
    manager_id: Optional[int] = None
    appraiser_id: Optional[int] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    employee_id: Optional[str] = None
    profile_picture: Optional[str] = None
    total_experience_years: Optional[int] = None
    company_experience_years: Optional[int] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserRegistration(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserApproval(BaseModel):
    user_id: int
    approval_status: ApprovalStatus
    reason: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    manager_id: Optional[int] = None
    appraiser_id: Optional[int] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    employee_id: Optional[str] = None
    profile_picture: Optional[str] = None
    total_experience_years: Optional[int] = None
    company_experience_years: Optional[int] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    approval_status: ApprovalStatus
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        # Also support orm_mode for backward compatibility
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str 