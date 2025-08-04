#!/usr/bin/env python3

from app.database import engine
from app.models import Base, User
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Create database tables
Base.metadata.create_all(bind=engine)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_pending_users():
    session = SessionLocal()
    
    # Check if pending users already exist
    existing_pending = session.query(User).filter(User.approval_status == "pending").count()
    if existing_pending > 0:
        print(f"Found {existing_pending} existing pending users")
        session.close()
        return
    
    # Add pending users
    pending_users = [
        {
            "employee_id": "EMP004",
            "name": "John Doe",
            "email": "john.doe@company.com",
            "password_hash": "Password123!",
            "role": "employee",
            "department": "Engineering",
            "title": "Software Engineer",
            "phone": "+1-555-0123",
            "approval_status": "pending",
            "created_at": datetime.utcnow()
        },
        {
            "employee_id": "EMP005",
            "name": "Jane Smith",
            "email": "jane.smith@company.com",
            "password_hash": "Password123!",
            "role": "employee",
            "department": "Marketing",
            "title": "Marketing Specialist",
            "phone": "+1-555-0124",
            "approval_status": "pending",
            "created_at": datetime.utcnow()
        },
        {
            "employee_id": "EMP006",
            "name": "Mike Wilson",
            "email": "mike.wilson@company.com",
            "password_hash": "Password123!",
            "role": "employee",
            "department": "Sales",
            "title": "Sales Representative",
            "phone": "+1-555-0125",
            "approval_status": "pending",
            "created_at": datetime.utcnow()
        }
    ]
    
    for user_data in pending_users:
        user = User(**user_data)
        session.add(user)
    
    session.commit()
    session.close()
    print("Added 3 pending users to database")

if __name__ == "__main__":
    add_pending_users() 