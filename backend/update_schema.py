#!/usr/bin/env python3
"""
Script to update database schema with new approval fields
"""
import sqlite3
import os
from datetime import datetime

def update_schema():
    """Update the database schema with new approval fields"""
    db_path = "epms.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if approval_status column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'approval_status' not in columns:
            print("Adding approval_status column...")
            cursor.execute("ALTER TABLE users ADD COLUMN approval_status TEXT DEFAULT 'pending'")
        
        if 'approved_by' not in columns:
            print("Adding approved_by column...")
            cursor.execute("ALTER TABLE users ADD COLUMN approved_by INTEGER")
        
        if 'approved_at' not in columns:
            print("Adding approved_at column...")
            cursor.execute("ALTER TABLE users ADD COLUMN approved_at DATETIME")
        
        # Update notification table if needed
        cursor.execute("PRAGMA table_info(notifications)")
        notification_columns = [column[1] for column in cursor.fetchall()]
        
        if 'related_user_id' not in notification_columns:
            print("Adding related_user_id column to notifications...")
            cursor.execute("ALTER TABLE notifications ADD COLUMN related_user_id INTEGER")
        
        # Update existing users to have approved status
        cursor.execute("UPDATE users SET approval_status = 'approved', is_active = 1 WHERE approval_status IS NULL")
        
        conn.commit()
        print("Database schema updated successfully!")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_schema() 