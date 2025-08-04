#!/usr/bin/env python3
"""
Script to fix enum values in the database
"""
import sqlite3
import os

def fix_enum_values():
    """Fix the enum values in the database"""
    db_path = "epms.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current enum values
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        # Find the approval_status column
        approval_status_col = None
        for col in columns:
            if col[1] == 'approval_status':
                approval_status_col = col
                break
        
        if approval_status_col:
            print(f"Current approval_status column: {approval_status_col}")
        
        # Update existing users to use the correct enum values
        print("Updating existing users...")
        cursor.execute("UPDATE users SET approval_status = 'PENDING' WHERE approval_status = 'pending'")
        cursor.execute("UPDATE users SET approval_status = 'APPROVED' WHERE approval_status = 'approved'")
        cursor.execute("UPDATE users SET approval_status = 'REJECTED' WHERE approval_status = 'rejected'")
        
        # Check what values we have now
        cursor.execute("SELECT DISTINCT approval_status FROM users")
        values = cursor.fetchall()
        print(f"Current approval_status values: {values}")
        
        conn.commit()
        print("Database enum values updated successfully!")
        
    except Exception as e:
        print(f"Error updating enum values: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_enum_values() 