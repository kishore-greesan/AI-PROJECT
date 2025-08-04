#!/usr/bin/env python3
"""
Simple seeding script for production database.
This script will create tables and seed data without running migrations.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app.models.user import User, UserRole, Base
from app.models.goal import Goal, GoalStatus
from app.models.review import Review, ReviewType
from app.utils.security import get_password_hash
from datetime import datetime, timedelta

def create_tables():
    """Create all tables."""
    print("🏗️ Creating database tables...")
    Base.metadata.create_all(bind=engine)

def seed_users():
    """Seed the database with initial users."""
    print("👥 Seeding users...")
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️ Users already exist in database. Skipping user seed.")
            return True
        
        # Create admin user
        admin_user = User(
            name="Admin User",
            email="admin@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.ADMIN,
            department="IT",
            title="System Administrator",
            phone="+1-555-0100",
            employee_id="EMP001",
            total_experience_years=8,
            company_experience_years=3,
            is_active=True,
            approval_status="approved"
        )
        
        # Create reviewer user
        reviewer_user = User(
            name="Manager User",
            email="manager@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.REVIEWER,
            department="Engineering",
            title="Engineering Manager",
            phone="+1-555-0101",
            employee_id="EMP002",
            total_experience_years=6,
            company_experience_years=2,
            is_active=True,
            approval_status="approved"
        )
        
        # Create employee user
        employee_user = User(
            name="Employee User",
            email="employee@test.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.EMPLOYEE,
            department="Engineering",
            title="Software Engineer",
            phone="+1-555-0102",
            employee_id="EMP003",
            total_experience_years=4,
            company_experience_years=1,
            is_active=True,
            approval_status="approved",
            manager_id=2,  # Manager User
            appraiser_id=2  # Manager User
        )
        
        # Add users to database
        db.add(admin_user)
        db.add(reviewer_user)
        db.add(employee_user)
        db.commit()
        
        print("✅ Users seeded successfully!")
        print("📋 Test Users Created:")
        print("   Admin: admin@test.com / Password123!")
        print("   Manager: manager@test.com / Password123!")
        print("   Employee: employee@test.com / Password123!")
        
    except Exception as e:
        print(f"❌ Error seeding users: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    return True

def seed_goals():
    """Seed the database with sample goals."""
    print("🎯 Seeding goals...")
    db = SessionLocal()
    
    try:
        # Check if goals already exist
        existing_goals = db.query(Goal).count()
        if existing_goals > 0:
            print("⚠️ Goals already exist in database. Skipping goal seed.")
            return True
        
        # Get employee user
        employee = db.query(User).filter(User.role == UserRole.EMPLOYEE).first()
        if not employee:
            print("❌ No employee found for goals")
            return False
        
        # Sample goals data
        sample_goals = [
            {
                "title": "Improve Team Collaboration",
                "description": "Enhance communication and teamwork within the development team",
                "target": "Implement daily standups and weekly retrospectives",
                "quarter": "Q1",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.submitted,
                "progress": 75
            },
            {
                "title": "Complete Project Milestone",
                "description": "Finish the current project phase and deliver on time",
                "target": "Complete all assigned tasks and meet project deadlines",
                "quarter": "Q2",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.approved,
                "progress": 100
            },
            {
                "title": "Learn New Technologies",
                "description": "Master React.js and implement it in current projects",
                "target": "Complete React.js certification and implement 2 features",
                "quarter": "Q3",
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=90),
                "status": GoalStatus.draft,
                "progress": 0
            }
        ]
        
        # Create goals
        for goal_data in sample_goals:
            goal = Goal(
                user_id=employee.id,
                title=goal_data["title"],
                description=goal_data["description"],
                target=goal_data["target"],
                quarter=goal_data["quarter"],
                start_date=goal_data["start_date"],
                end_date=goal_data["end_date"],
                status=goal_data["status"],
                progress=goal_data["progress"]
            )
            db.add(goal)
            print(f"✅ Created goal: {goal_data['title']}")
        
        db.commit()
        print(f"✅ Created {len(sample_goals)} sample goals")
        
    except Exception as e:
        print(f"❌ Error seeding goals: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    return True

def seed_reviews():
    """Seed the database with sample reviews."""
    print("📝 Seeding reviews...")
    db = SessionLocal()
    
    try:
        # Check if reviews already exist
        existing_reviews = db.query(Review).count()
        if existing_reviews > 0:
            print("⚠️ Reviews already exist in database. Skipping review seed.")
            return True
        
        # Get users
        reviewer = db.query(User).filter(User.role == UserRole.REVIEWER).first()
        employee = db.query(User).filter(User.role == UserRole.EMPLOYEE).first()
        goal = db.query(Goal).first()
        
        if not reviewer or not employee or not goal:
            print("❌ Missing users or goals for reviews")
            return False
        
        # Create sample review
        review = Review(
            goal_id=goal.id,
            reviewer_id=reviewer.id,
            review_type=ReviewType.manager_review,
            quarter="Q1 2024",
            rating=4,
            comments="Good progress on team collaboration. Keep up the excellent work!",
            strengths="Excellent communication skills and team collaboration",
            areas_for_improvement="Could improve technical documentation"
        )
        
        db.add(review)
        db.commit()
        print("✅ Created sample review")
        
    except Exception as e:
        print(f"❌ Error seeding reviews: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    return True

def main():
    """Main function to run all seeding."""
    print("🚀 Starting database seeding...")
    
    # Step 1: Create tables
    create_tables()
    
    # Step 2: Seed users
    if not seed_users():
        print("❌ User seeding failed. Exiting.")
        return False
    
    # Step 3: Seed goals
    if not seed_goals():
        print("❌ Goal seeding failed. Exiting.")
        return False
    
    # Step 4: Seed reviews
    if not seed_reviews():
        print("❌ Review seeding failed. Exiting.")
        return False
    
    print("🎉 Database seeding completed successfully!")
    print("📊 Summary:")
    print("   ✅ Tables: Created")
    print("   ✅ Users: 3 test users created")
    print("   ✅ Goals: 3 sample goals created")
    print("   ✅ Reviews: 1 sample review created")
    print("\n🔑 Login Credentials:")
    print("   Admin: admin@test.com / Password123!")
    print("   Manager: manager@test.com / Password123!")
    print("   Employee: employee@test.com / Password123!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 