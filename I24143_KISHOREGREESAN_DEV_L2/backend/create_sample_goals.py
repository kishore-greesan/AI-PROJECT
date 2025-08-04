#!/usr/bin/env python3
"""
Script to create sample goals for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.goal import Goal, GoalStatus
from datetime import datetime, timedelta

def create_sample_goals():
    """Create sample goals for testing."""
    db = SessionLocal()
    
    try:
        # Get users
        users = db.query(User).filter(User.role == UserRole.REVIEWER).all()
        employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).all()
        
        if not employees:
            print("❌ No employees found")
            return
        
        # Sample goals data
        sample_goals = [
            {
                "title": "Improve Code Quality",
                "description": "Implement better coding practices and reduce technical debt",
                "target": "Reduce code complexity by 20%",
                "quarter": "Q1",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.draft
            },
            {
                "title": "Learn New Framework",
                "description": "Master React.js and implement it in current projects",
                "target": "Complete React.js certification and implement 2 features",
                "quarter": "Q2",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.draft
            },
            {
                "title": "Team Leadership",
                "description": "Take on more leadership responsibilities and mentor junior developers",
                "target": "Lead 2 projects and mentor 3 junior developers",
                "quarter": "Q3",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.draft
            },
            {
                "title": "Performance Optimization",
                "description": "Optimize application performance and reduce load times",
                "target": "Improve page load times by 30%",
                "quarter": "Q4",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.draft
            }
        ]
        
        # Create goals for each employee
        for i, employee in enumerate(employees):
            for j, goal_data in enumerate(sample_goals):
                goal = Goal(
                    user_id=employee.id,
                    title=goal_data["title"],
                    description=goal_data["description"],
                    target=goal_data["target"],
                    quarter=goal_data["quarter"],
                    start_date=goal_data["start_date"],
                    end_date=goal_data["end_date"],
                    status=goal_data["status"],
                    progress=0
                )
                db.add(goal)
                print(f"✅ Created goal '{goal_data['title']}' for {employee.name}")
        
        db.commit()
        print(f"✅ Created {len(sample_goals) * len(employees)} sample goals")
        
    except Exception as e:
        print(f"❌ Error creating goals: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_goals() 