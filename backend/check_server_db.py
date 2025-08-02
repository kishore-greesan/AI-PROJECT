#!/usr/bin/env python3
"""
Check what database the server is using.
"""

from app.config.settings import settings
from app.database import engine, SessionLocal
from app.models.user import User

def check_server_db():
    """Check what database the server is using."""
    print(f"Database URL: {settings.DATABASE_URL}")
    
    # Test database connection
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in server database")
        for user in users:
            print(f"  - {user.name} ({user.email}) - Role: {user.role}")
    except Exception as e:
        print(f"Error accessing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_server_db() 