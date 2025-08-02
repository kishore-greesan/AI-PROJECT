from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse, RefreshTokenRequest
from app.models.user import UserRole, User
from app.utils.security import get_current_user, verify_token, create_access_token, create_refresh_token
from app.utils.dependencies import get_admin_user
from app.utils.exceptions import raise_unauthorized

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT tokens.
    """
    auth_service = AuthService(db)
    
    # Authenticate user
    user = auth_service.authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise raise_unauthorized("Invalid credentials")
    
    # Create tokens
    tokens = auth_service.create_tokens(user)
    
    # Update last login
    auth_service.update_user_last_login(user)
    
    return tokens

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    """
    Register a new user (Admin only).
    """
    auth_service = AuthService(db)
    
    # Create user
    user = auth_service.create_user(user_data)
    
    return user

@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.
    """
    # Verify refresh token
    token_data = verify_token(request.refresh_token)
    if not token_data:
        raise raise_unauthorized("Invalid refresh token")
    
    # Get user
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(token_data.user_id)
    if not user or not user.is_active:
        raise raise_unauthorized("User not found or inactive")
    
    # Create new tokens
    token_data_dict = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role.value
    }
    
    new_access_token = create_access_token(token_data_dict)
    new_refresh_token = create_refresh_token(token_data_dict)
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=15 * 60
    )

@router.post("/logout")
def logout():
    """
    Logout user (client should discard tokens).
    """
    return {"message": "Successfully logged out"} 