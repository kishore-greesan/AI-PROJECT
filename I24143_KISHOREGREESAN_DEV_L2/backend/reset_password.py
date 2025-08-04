#!/usr/bin/env python3
"""
Script to reset a user's password
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def reset_password(email, new_password):
    """Reset password for a user."""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User {email} not found")
            return
        
        # Update password
        user.password_hash = get_password_hash(new_password)
        db.commit()
        
        print(f"✅ Password reset for {email} to: {new_password}")
        
    except Exception as e:
        print(f"❌ Error resetting password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Reset password for greesan user
    reset_password("greesan@test.com", "password")
    reset_password("admin@test.com", "password")
    reset_password("reviewer@test.com", "password") 