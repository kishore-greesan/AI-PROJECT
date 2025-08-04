#!/usr/bin/env python3

from app.database import engine
from app.models import Base, User
from sqlalchemy.orm import sessionmaker

# Create database tables
Base.metadata.create_all(bind=engine)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_user_status():
    session = SessionLocal()
    
    # Get all users
    users = session.query(User).all()
    print(f"Found {len(users)} users in database")
    
    for user in users:
        print(f"User: {user.name} ({user.email}) - Current status: {user.approval_status}")
        
        # Update users to have pending status (except admin)
        if user.role != "admin":
            user.approval_status = "pending"
            print(f"  -> Updated to pending")
        else:
            user.approval_status = "approved"
            print(f"  -> Updated to approved")
    
    session.commit()
    session.close()
    print("User statuses updated!")

if __name__ == "__main__":
    update_user_status() 