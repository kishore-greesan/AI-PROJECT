#!/usr/bin/env python3
"""
Script to create an admin user for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole, ApprovalStatus
from app.utils.security import get_password_hash
from datetime import datetime

def create_admin_user():
    """Create an admin user for testing"""
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin_user = User(
            name="System Administrator",
            email="admin@example.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            department="IT",
            title="System Administrator",
            approval_status=ApprovalStatus.APPROVED,
            is_active=True,
            approved_by=None,
            approved_at=datetime.now()
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Admin user created successfully!")
        print(f"Email: admin@example.com")
        print(f"Password: admin123")
        print(f"User ID: {admin_user.id}")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user() 