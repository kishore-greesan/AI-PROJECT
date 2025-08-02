#!/usr/bin/env python3

from app.database import engine
from sqlalchemy import text

def add_appraiser_column():
    try:
        with engine.connect() as conn:
            # For SQLite, we'll try to add the column and catch the error if it already exists
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN appraiser_id INTEGER
                """))
                conn.commit()
                print("✅ Successfully added appraiser_id column to users table")
            except Exception as e:
                if "duplicate column name" in str(e) or "already exists" in str(e):
                    print("✅ appraiser_id column already exists")
                else:
                    raise e
                    
    except Exception as e:
        print(f"❌ Error adding appraiser_id column: {e}")

if __name__ == "__main__":
    add_appraiser_column() 