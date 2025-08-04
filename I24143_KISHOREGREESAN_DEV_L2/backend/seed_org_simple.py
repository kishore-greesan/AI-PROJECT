#!/usr/bin/env python3
"""
Simple script to seed the database with organizational hierarchy data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.organization import Department, Team, Position

def seed_org_hierarchy():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding organizational hierarchy...")
        
        # Create Departments
        departments = [
            {
                "name": "Engineering",
                "description": "Software development and technical operations",
                "manager_id": 2  # Manager User
            },
            {
                "name": "Product Management", 
                "description": "Product strategy, planning, and execution",
                "manager_id": 4  # Kishore
            },
            {
                "name": "Sales & Marketing",
                "description": "Customer acquisition and brand management", 
                "manager_id": 6  # New Docker
            },
            {
                "name": "Human Resources",
                "description": "Talent acquisition and employee development",
                "manager_id": 7  # Test User
            },
            {
                "name": "Finance & Operations",
                "description": "Financial planning and operational efficiency",
                "manager_id": 1  # Admin
            }
        ]
        
        for dept_data in departments:
            dept = Department(**dept_data)
            db.add(dept)
        
        db.commit()
        print("✅ Created 5 departments")
        
        # Create Teams
        teams = [
            {
                "name": "Frontend Development",
                "description": "React, Vue, and UI/UX development",
                "department_id": 1,
                "team_lead_id": 2
            },
            {
                "name": "Backend Development",
                "description": "API development and database management", 
                "department_id": 1,
                "team_lead_id": 3
            },
            {
                "name": "DevOps & Infrastructure",
                "description": "Cloud infrastructure and deployment automation",
                "department_id": 1,
                "team_lead_id": 5
            },
            {
                "name": "Product Strategy",
                "description": "Product roadmap and market analysis",
                "department_id": 2,
                "team_lead_id": 4
            },
            {
                "name": "Digital Marketing",
                "description": "Online marketing and brand awareness",
                "department_id": 3,
                "team_lead_id": 6
            },
            {
                "name": "Talent Acquisition",
                "description": "Recruitment and hiring processes",
                "department_id": 4,
                "team_lead_id": 7
            }
        ]
        
        for team_data in teams:
            team = Team(**team_data)
            db.add(team)
        
        db.commit()
        print("✅ Created 6 teams")
        
        # Create Positions
        positions = [
            # Engineering positions
            {"title": "Junior Software Engineer", "level": 1, "department_id": 1},
            {"title": "Software Engineer", "level": 2, "department_id": 1},
            {"title": "Senior Software Engineer", "level": 3, "department_id": 1},
            {"title": "Tech Lead", "level": 4, "department_id": 1},
            {"title": "Engineering Manager", "level": 5, "department_id": 1},
            
            # Product positions
            {"title": "Product Analyst", "level": 1, "department_id": 2},
            {"title": "Product Manager", "level": 3, "department_id": 2},
            {"title": "Senior Product Manager", "level": 4, "department_id": 2},
            {"title": "Director of Product", "level": 5, "department_id": 2},
            
            # Sales & Marketing positions
            {"title": "Marketing Specialist", "level": 1, "department_id": 3},
            {"title": "Marketing Manager", "level": 3, "department_id": 3},
            {"title": "Sales Representative", "level": 2, "department_id": 3},
            {"title": "Sales Manager", "level": 4, "department_id": 3},
            
            # HR positions
            {"title": "HR Coordinator", "level": 1, "department_id": 4},
            {"title": "HR Specialist", "level": 2, "department_id": 4},
            {"title": "HR Manager", "level": 4, "department_id": 4},
            
            # Finance positions
            {"title": "Financial Analyst", "level": 2, "department_id": 5},
            {"title": "Senior Financial Analyst", "level": 3, "department_id": 5},
            {"title": "Finance Manager", "level": 4, "department_id": 5}
        ]
        
        for pos_data in positions:
            position = Position(**pos_data)
            db.add(position)
        
        db.commit()
        print("✅ Created 19 positions")
        
        # Update user assignments using raw SQL to avoid relationship issues
        assignments = [
            {"user_id": 1, "department_id": 1, "team_id": 1},  # Admin -> Engineering -> Frontend
            {"user_id": 2, "department_id": 1, "team_id": 1},  # Manager -> Engineering -> Frontend
            {"user_id": 3, "department_id": 1, "team_id": 2},  # Employee -> Engineering -> Backend
            {"user_id": 4, "department_id": 2, "team_id": 4},  # Kishore -> Product -> Strategy
            {"user_id": 5, "department_id": 1, "team_id": 3},  # Docker Test -> Engineering -> DevOps
            {"user_id": 6, "department_id": 3, "team_id": 5},  # New Docker -> Sales -> Digital Marketing
            {"user_id": 7, "department_id": 4, "team_id": 6},  # Test User -> HR -> Talent Acquisition
            {"user_id": 8, "department_id": 1, "team_id": 1},  # Frontend Test -> Engineering -> Frontend
            {"user_id": 9, "department_id": 2, "team_id": 4},  # Test Employee -> Product -> Strategy
        ]
        
        for assignment in assignments:
            db.execute(
                "UPDATE users SET department_id = :dept_id, team_id = :team_id WHERE id = :user_id",
                assignment
            )
        
        db.commit()
        print("✅ Updated user assignments")
        
        print(f"🎉 Successfully seeded organizational hierarchy!")
        
    except Exception as e:
        print(f"❌ Error seeding org hierarchy: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_org_hierarchy() 