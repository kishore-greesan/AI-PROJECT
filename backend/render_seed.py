#!/usr/bin/env python3
"""
Production seeding script for Render deployment with comprehensive mock data.
This script will seed the production database with rich mock data for reports.
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
import random

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
        
        # Create multiple reviewer users
        reviewer_users = [
            User(
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
            ),
            User(
                name="Sarah Johnson",
                email="sarah@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.REVIEWER,
                department="Marketing",
                title="Marketing Manager",
                phone="+1-555-0102",
                employee_id="EMP003",
                total_experience_years=5,
                company_experience_years=2,
                is_active=True,
                approval_status="approved"
            ),
            User(
                name="Mike Chen",
                email="mike@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.REVIEWER,
                department="Sales",
                title="Sales Manager",
                phone="+1-555-0103",
                employee_id="EMP004",
                total_experience_years=7,
                company_experience_years=3,
                is_active=True,
                approval_status="approved"
            )
        ]
        
        # Create multiple employee users
        employee_users = [
            User(
                name="Employee User",
                email="employee@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.EMPLOYEE,
                department="Engineering",
                title="Software Engineer",
                phone="+1-555-0104",
                employee_id="EMP005",
                total_experience_years=4,
                company_experience_years=1,
                is_active=True,
                approval_status="approved",
                manager_id=2,  # Manager User
                appraiser_id=2
            ),
            User(
                name="John Smith",
                email="john@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.EMPLOYEE,
                department="Engineering",
                title="Frontend Developer",
                phone="+1-555-0105",
                employee_id="EMP006",
                total_experience_years=3,
                company_experience_years=1,
                is_active=True,
                approval_status="approved",
                manager_id=2,  # Manager User
                appraiser_id=2
            ),
            User(
                name="Emily Davis",
                email="emily@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.EMPLOYEE,
                department="Marketing",
                title="Marketing Specialist",
                phone="+1-555-0106",
                employee_id="EMP007",
                total_experience_years=2,
                company_experience_years=1,
                is_active=True,
                approval_status="approved",
                manager_id=3,  # Sarah Johnson
                appraiser_id=3
            ),
            User(
                name="David Wilson",
                email="david@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.EMPLOYEE,
                department="Sales",
                title="Sales Representative",
                phone="+1-555-0107",
                employee_id="EMP008",
                total_experience_years=3,
                company_experience_years=2,
                is_active=True,
                approval_status="approved",
                manager_id=4,  # Mike Chen
                appraiser_id=4
            ),
            User(
                name="Lisa Brown",
                email="lisa@test.com",
                password_hash=get_password_hash("Password123!"),
                role=UserRole.EMPLOYEE,
                department="Engineering",
                title="Backend Developer",
                phone="+1-555-0108",
                employee_id="EMP009",
                total_experience_years=5,
                company_experience_years=2,
                is_active=True,
                approval_status="approved",
                manager_id=2,  # Manager User
                appraiser_id=2
            )
        ]
        
        # Add all users to database
        db.add(admin_user)
        for user in reviewer_users:
            db.add(user)
        for user in employee_users:
            db.add(user)
        db.commit()
        
        print("✅ Users seeded successfully!")
        print("📋 Test Users Created:")
        print("   Admin: admin@test.com / Password123!")
        print("   Managers: manager@test.com, sarah@test.com, mike@test.com / Password123!")
        print("   Employees: employee@test.com, john@test.com, emily@test.com, david@test.com, lisa@test.com / Password123!")
        
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
        
        # Get employee users
        employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).all()
        if not employees:
            print("❌ No employees found for goals")
            return False
        
        # Sample goals data with different statuses and progress
        sample_goals = [
            {
                "title": "Improve Team Collaboration",
                "description": "Enhance communication and teamwork within the development team",
                "target": "Implement daily standups and weekly retrospectives",
                "quarter": "Q1",
                "start_date": datetime.now() - timedelta(days=60),
                "end_date": datetime.now() + timedelta(days=30),
                "status": GoalStatus.submitted,
                "progress": 75
            },
            {
                "title": "Complete Project Milestone",
                "description": "Finish the current project phase and deliver on time",
                "target": "Complete all assigned tasks and meet project deadlines",
                "quarter": "Q2",
                "start_date": datetime.now() - timedelta(days=90),
                "end_date": datetime.now() - timedelta(days=10),
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
            },
            {
                "title": "Performance Optimization",
                "description": "Optimize application performance and reduce load times",
                "target": "Improve page load times by 30%",
                "quarter": "Q1",
                "start_date": datetime.now() - timedelta(days=45),
                "end_date": datetime.now() + timedelta(days=45),
                "status": GoalStatus.submitted,
                "progress": 60
            },
            {
                "title": "Code Quality Improvement",
                "description": "Implement better coding practices and reduce technical debt",
                "target": "Reduce code complexity by 20%",
                "quarter": "Q2",
                "start_date": datetime.now() - timedelta(days=30),
                "end_date": datetime.now() + timedelta(days=60),
                "status": GoalStatus.approved,
                "progress": 85
            },
            {
                "title": "Team Leadership",
                "description": "Take on more leadership responsibilities and mentor junior developers",
                "target": "Lead 2 projects and mentor 3 junior developers",
                "quarter": "Q3",
                "start_date": datetime.now() - timedelta(days=15),
                "end_date": datetime.now() + timedelta(days=75),
                "status": GoalStatus.submitted,
                "progress": 40
            }
        ]
        
        # Create goals for each employee with varied data
        for i, employee in enumerate(employees):
            # Create 2-4 goals per employee
            num_goals = random.randint(2, 4)
            selected_goals = random.sample(sample_goals, num_goals)
            
            for goal_data in selected_goals:
                # Vary progress slightly for each employee
                progress_variation = random.randint(-10, 10)
                progress = max(0, min(100, goal_data["progress"] + progress_variation))
                
                goal = Goal(
                    user_id=employee.id,
                    title=goal_data["title"],
                    description=goal_data["description"],
                    target=goal_data["target"],
                    quarter=goal_data["quarter"],
                    start_date=goal_data["start_date"],
                    end_date=goal_data["end_date"],
                    status=goal_data["status"],
                    progress=progress
                )
                db.add(goal)
                print(f"✅ Created goal: {goal_data['title']} for {employee.name} (Progress: {progress}%)")
        
        db.commit()
        print(f"✅ Created goals for all employees")
        
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
        reviewers = db.query(User).filter(User.role == UserRole.REVIEWER).all()
        employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).all()
        goals = db.query(Goal).filter(Goal.status.in_([GoalStatus.submitted, GoalStatus.approved])).all()
        
        if not reviewers or not employees or not goals:
            print("❌ Missing users or goals for reviews")
            return False
        
        # Sample review data
        review_comments = [
            "Excellent progress on team collaboration. Keep up the great work!",
            "Good work on the project milestone. Well done!",
            "Strong performance in learning new technologies.",
            "Great improvement in code quality. Continue the good work!",
            "Outstanding leadership skills demonstrated.",
            "Good progress, but could improve in some areas.",
            "Excellent technical skills and problem-solving abilities.",
            "Great communication and teamwork skills."
        ]
        
        # Create reviews for submitted and approved goals
        for goal in goals:
            if goal.status in [GoalStatus.submitted, GoalStatus.approved]:
                # Assign a random reviewer
                reviewer = random.choice(reviewers)
                
                # Generate random rating (3-5)
                rating = random.randint(3, 5)
                
                # Select random comment
                comment = random.choice(review_comments)
                
                review = Review(
                    goal_id=goal.id,
                    reviewer_id=reviewer.id,
                    review_type=ReviewType.manager_review,
                    quarter=goal.quarter + " 2024",
                    rating=rating,
                    comments=comment,
                    strengths="Good technical skills and teamwork",
                    areas_for_improvement="Could improve documentation"
                )
                
                db.add(review)
                print(f"✅ Created review for goal: {goal.title} (Rating: {rating})")
        
        db.commit()
        print("✅ Created sample reviews")
        
    except Exception as e:
        print(f"❌ Error seeding reviews: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    return True

def main():
    """Main function to run all seeding."""
    print("🚀 Starting production database seeding with comprehensive mock data...")
    
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
    
    print("🎉 Production database seeding completed successfully!")
    print("📊 Summary:")
    print("   ✅ Tables: Created")
    print("   ✅ Users: 9 test users created (1 Admin, 3 Managers, 5 Employees)")
    print("   ✅ Goals: Multiple goals per employee with varied progress")
    print("   ✅ Reviews: Reviews for submitted and approved goals")
    print("\n🔑 Login Credentials:")
    print("   Admin: admin@test.com / Password123!")
    print("   Managers: manager@test.com, sarah@test.com, mike@test.com / Password123!")
    print("   Employees: employee@test.com, john@test.com, emily@test.com, david@test.com, lisa@test.com / Password123!")
    print("\n📈 Reports should now show rich data!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 