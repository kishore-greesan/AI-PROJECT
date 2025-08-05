import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

def get_password_hash(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a simple access token (temporary for deployment)."""
    # For now, just return a simple token
    return f"token_{secrets.token_hex(16)}"

def create_refresh_token(data: dict) -> str:
    """Create a simple refresh token (temporary for deployment)."""
    return f"refresh_{secrets.token_hex(16)}"

def get_current_user(token: str):
    """Get current user from token (simplified for deployment)."""
    # For now, return a mock user
    return None 