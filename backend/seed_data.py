#!/usr/bin/env python3
"""
Seed script to populate the database with initial users for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app.models.user import User, UserRole, Base
from app.utils.security import get_password_hash

def create_tables():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)

def seed_users():
    """Seed the database with initial users."""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Users already exist in database. Skipping seed.")
            return
        
        # Create admin user
        admin_user = User(
            name="Admin User",
            email="admin@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.ADMIN,
            department="IT",
            title="System Administrator",
            phone="+1-555-0100",
            employee_id="EMP001",
            total_experience_years=8,
            company_experience_years=3,
            is_active=True
        )
        
        # Create reviewer user
        reviewer_user = User(
            name="Manager User",
            email="manager@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.REVIEWER,
            department="Engineering",
            title="Engineering Manager",
            phone="+1-555-0101",
            employee_id="EMP002",
            total_experience_years=6,
            company_experience_years=2,
            is_active=True
        )
        
        # Create employee user
        employee_user = User(
            name="Employee User",
            email="employee@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.EMPLOYEE,
            department="Engineering",
            title="Software Engineer",
            phone="+1-555-0102",
            employee_id="EMP003",
            total_experience_years=4,
            company_experience_years=1,
            is_active=True
        )
        
        # Add users to database
        db.add(admin_user)
        db.add(reviewer_user)
        db.add(employee_user)
        db.commit()
        
        print("✅ Database seeded successfully!")
        print("📋 Test Users Created:")
        print("   Admin: admin@test.com / Password123!")
        print("   Manager: manager@test.com / Password123!")
        print("   Employee: employee@test.com / Password123!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding database...")
    create_tables()
    seed_users()
    print("✅ Seeding complete!") 