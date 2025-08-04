#!/usr/bin/env python3

from app.database import engine
from sqlalchemy import text

def add_appraiser_column():
    try:
        with engine.connect() as conn:
            # Check if appraiser_id column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'appraiser_id'
            """))
            
            if result.fetchone():
                print("✅ appraiser_id column already exists")
                return
            
            # Add appraiser_id column
            conn.execute(text("""
                ALTER TABLE users 
                ADD appraiser_id INTEGER
            """))
            
            conn.commit()
            print("✅ Successfully added appraiser_id column to users table")
            
    except Exception as e:
        print(f"❌ Error adding appraiser_id column: {e}")

if __name__ == "__main__":
    add_appraiser_column() 