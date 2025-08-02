#!/usr/bin/env python3
"""
Test API login functionality.
"""

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password

def test_api_login():
    """Test API login functionality."""
    db = SessionLocal()
    
    try:
        # Simulate the exact API login process
        email = "admin@test.com"
        password = "admin123"
        
        # Get user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("❌ User not found")
            return
        
        print(f"✅ Found user: {user.name} ({user.email})")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            print("❌ Password verification failed")
            return
        
        print("✅ Password verification successful")
        
        # Check if user is active
        if not user.is_active:
            print("❌ User is not active")
            return
        
        print("✅ User is active")
        print("✅ Login would be successful!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_api_login() 