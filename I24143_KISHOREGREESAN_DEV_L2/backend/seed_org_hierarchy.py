#!/usr/bin/env python3
"""
Script to seed the database with organizational hierarchy data.
This creates departments, teams, and positions for a realistic company structure.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.organization import Department, Team, Position
from datetime import datetime

def seed_org_hierarchy():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding organizational hierarchy...")
        
        # Create Departments
        departments = [
            {
                "name": "Engineering",
                "description": "Software development and technical operations",
                "manager_id": None  # Will be set after creating users
            },
            {
                "name": "Product Management",
                "description": "Product strategy, planning, and execution",
                "manager_id": None
            },
            {
                "name": "Sales & Marketing",
                "description": "Customer acquisition and brand management",
                "manager_id": None
            },
            {
                "name": "Human Resources",
                "description": "Talent acquisition and employee development",
                "manager_id": None
            },
            {
                "name": "Finance & Operations",
                "description": "Financial planning and operational efficiency",
                "manager_id": None
            }
        ]
        
        created_departments = []
        for dept_data in departments:
            dept = Department(**dept_data)
            db.add(dept)
            db.commit()
            db.refresh(dept)
            created_departments.append(dept)
            print(f"✅ Created department: {dept.name}")
        
        # Create Teams within departments
        teams = [
            {
                "name": "Frontend Development",
                "description": "React, Vue, and UI/UX development",
                "department_id": 1,  # Engineering
                "team_lead_id": None
            },
            {
                "name": "Backend Development", 
                "description": "API development and database management",
                "department_id": 1,  # Engineering
                "team_lead_id": None
            },
            {
                "name": "DevOps & Infrastructure",
                "description": "Cloud infrastructure and deployment automation",
                "department_id": 1,  # Engineering
                "team_lead_id": None
            },
            {
                "name": "Product Strategy",
                "description": "Product roadmap and market analysis",
                "department_id": 2,  # Product Management
                "team_lead_id": None
            },
            {
                "name": "Digital Marketing",
                "description": "Online marketing and brand awareness",
                "department_id": 3,  # Sales & Marketing
                "team_lead_id": None
            },
            {
                "name": "Talent Acquisition",
                "description": "Recruitment and hiring processes",
                "department_id": 4,  # Human Resources
                "team_lead_id": None
            }
        ]
        
        created_teams = []
        for team_data in teams:
            team = Team(**team_data)
            db.add(team)
            db.commit()
            db.refresh(team)
            created_teams.append(team)
            print(f"✅ Created team: {team.name}")
        
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
        print(f"✅ Created {len(positions)} positions")
        
        # Update existing users with department and team assignments
        users = db.query(User).all()
        
        # Assign users to departments and teams
        assignments = [
            # Admin user
            {"user_id": 1, "department_id": 1, "team_id": 1},  # Admin -> Engineering -> Frontend
            # Manager user  
            {"user_id": 2, "department_id": 1, "team_id": 1},  # Manager -> Engineering -> Frontend
            # Employee users
            {"user_id": 3, "department_id": 1, "team_id": 2},  # Employee -> Engineering -> Backend
            {"user_id": 4, "department_id": 2, "team_id": 4},  # Kishore -> Product -> Strategy
            {"user_id": 5, "department_id": 1, "team_id": 3},  # Docker Test -> Engineering -> DevOps
            {"user_id": 6, "department_id": 3, "team_id": 5},  # New Docker -> Sales -> Digital Marketing
            {"user_id": 7, "department_id": 4, "team_id": 6},  # Test User -> HR -> Talent Acquisition
            {"user_id": 8, "department_id": 1, "team_id": 1},  # Frontend Test -> Engineering -> Frontend
            {"user_id": 9, "department_id": 2, "team_id": 4},  # Test Employee -> Product -> Strategy
        ]
        
        for assignment in assignments:
            user = db.query(User).filter(User.id == assignment["user_id"]).first()
            if user:
                user.department_id = assignment["department_id"]
                user.team_id = assignment["team_id"]
        
        # Set department managers
        dept_managers = [
            {"dept_id": 1, "manager_id": 2},  # Engineering -> Manager User
            {"dept_id": 2, "manager_id": 4},  # Product -> Kishore
            {"dept_id": 3, "manager_id": 6},  # Sales -> New Docker
            {"dept_id": 4, "manager_id": 7},  # HR -> Test User
            {"dept_id": 5, "manager_id": 1},  # Finance -> Admin
        ]
        
        for dept_mgr in dept_managers:
            dept = db.query(Department).filter(Department.id == dept_mgr["dept_id"]).first()
            if dept:
                dept.manager_id = dept_mgr["manager_id"]
        
        # Set team leads
        team_leads = [
            {"team_id": 1, "lead_id": 2},  # Frontend -> Manager User
            {"team_id": 2, "lead_id": 3},  # Backend -> Employee User
            {"team_id": 3, "lead_id": 5},  # DevOps -> Docker Test
            {"team_id": 4, "lead_id": 4},  # Product Strategy -> Kishore
            {"team_id": 5, "lead_id": 6},  # Digital Marketing -> New Docker
            {"team_id": 6, "lead_id": 7},  # Talent Acquisition -> Test User
        ]
        
        for team_lead in team_leads:
            team = db.query(Team).filter(Team.id == team_lead["team_id"]).first()
            if team:
                team.team_lead_id = team_lead["lead_id"]
        
        db.commit()
        print("✅ Updated user assignments and leadership roles")
        
        print(f"🎉 Successfully seeded organizational hierarchy!")
        print(f"📊 Created {len(created_departments)} departments")
        print(f"👥 Created {len(created_teams)} teams") 
        print(f"💼 Created {len(positions)} positions")
        print(f"👤 Updated {len(assignments)} user assignments")
        
    except Exception as e:
        print(f"❌ Error seeding org hierarchy: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_org_hierarchy() 