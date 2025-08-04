#!/usr/bin/env python3
"""
Script to update SQL Server database schema with approval fields
"""
import pyodbc
import os
from datetime import datetime

def update_mssql_schema():
    """Update the SQL Server database schema with approval fields"""
    # SQL Server connection string from docker-compose
    connection_string = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=db;"
        "DATABASE=epms;"
        "UID=sa;"
        "PWD=Password123!;"
    )
    
    try:
        # Connect to SQL Server
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        print("Connected to SQL Server database")
        
        # Check if approval_status column exists
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'approval_status'
        """)
        
        if not cursor.fetchone():
            print("Adding approval_status column...")
            cursor.execute("""
                ALTER TABLE users 
                ADD approval_status NVARCHAR(20) DEFAULT 'PENDING'
            """)
        
        # Check if approved_by column exists
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'approved_by'
        """)
        
        if not cursor.fetchone():
            print("Adding approved_by column...")
            cursor.execute("""
                ALTER TABLE users 
                ADD approved_by INT NULL
            """)
        
        # Check if approved_at column exists
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'approved_at'
        """)
        
        if not cursor.fetchone():
            print("Adding approved_at column...")
            cursor.execute("""
                ALTER TABLE users 
                ADD approved_at DATETIME NULL
            """)
        
        # Check if related_user_id column exists in notifications table
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'related_user_id'
        """)
        
        if not cursor.fetchone():
            print("Adding related_user_id column to notifications...")
            cursor.execute("""
                ALTER TABLE notifications 
                ADD related_user_id INT NULL
            """)
        
        # Update existing users to have approved status
        cursor.execute("""
            UPDATE users 
            SET approval_status = 'APPROVED', is_active = 1 
            WHERE approval_status IS NULL
        """)
        
        conn.commit()
        print("SQL Server database schema updated successfully!")
        
    except Exception as e:
        print(f"Error updating SQL Server schema: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    update_mssql_schema() 