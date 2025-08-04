from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.organization import Department, Team, Position
from app.utils.security import get_current_user
from typing import List, Dict, Any

router = APIRouter()

@router.get("/org-hierarchy")
async def get_org_hierarchy(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organizational hierarchy for the current user"""
    try:
        # Get user's department info (using the department string field)
        user_dept = None
        if current_user.department:
            user_dept = db.query(Department).filter(Department.name == current_user.department).first()
        
        # Get all departments with their teams
        departments = db.query(Department).all()
        org_structure = []
        
        for dept in departments:
            dept_data = {
                "id": dept.id,
                "name": dept.name,
                "description": dept.description,
                "manager_id": dept.manager_id,
                "teams": []
            }
            
            # Get teams for this department
            teams = db.query(Team).filter(Team.department_id == dept.id).all()
            for team in teams:
                team_data = {
                    "id": team.id,
                    "name": team.name,
                    "description": team.description,
                    "team_lead_id": team.team_lead_id
                }
                dept_data["teams"].append(team_data)
            
            org_structure.append(dept_data)
        
        # Get user's position info
        user_position = None
        if user_dept:
            positions = db.query(Position).filter(Position.department_id == user_dept.id).all()
            # For now, assign a default position based on user role
            if current_user.role == "admin":
                user_position = "Engineering Manager"
            elif current_user.role == "reviewer":
                user_position = "Tech Lead"
            else:
                user_position = "Software Engineer"
        
        return {
            "user_info": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role,
                "department": user_dept.name if user_dept else current_user.department,
                "team": None,  # No team_id in User model
                "position": user_position,
                "manager_id": current_user.manager_id,
                "department_id": user_dept.id if user_dept else None,
                "team_id": None  # No team_id in User model
            },
            "org_structure": org_structure
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching org hierarchy: {str(e)}")

@router.get("/user-profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed user profile information"""
    try:
        # Get user's department (using the department string field)
        user_dept = None
        if current_user.department:
            user_dept = db.query(Department).filter(Department.name == current_user.department).first()
        
        # Get user's manager
        manager = None
        if current_user.manager_id:
            manager = db.query(User).filter(User.id == current_user.manager_id).first()
        
        # Get user's direct reports
        direct_reports = db.query(User).filter(User.manager_id == current_user.id).all()
        
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "department": current_user.department,
            "title": current_user.title,
            "phone": current_user.phone,
            "profile_picture": current_user.profile_picture,
            "total_experience_years": current_user.total_experience_years,
            "company_experience_years": current_user.company_experience_years,
            "manager": {
                "id": manager.id,
                "name": manager.name,
                "email": manager.email,
                "role": manager.role
            } if manager else None,
            "direct_reports": [
                {
                    "id": report.id,
                    "name": report.name,
                    "email": report.email,
                    "role": report.role,
                    "department": report.department,
                    "title": report.title
                } for report in direct_reports
            ],
            "department_info": {
                "id": user_dept.id,
                "name": user_dept.name,
                "description": user_dept.description
            } if user_dept else None,
            "team_info": None,  # No team_id in User model
            "stats": {
                "total_experience_years": current_user.total_experience_years or 0,
                "company_experience_years": current_user.company_experience_years or 0,
                "direct_reports_count": len(direct_reports),
                "active_goals_count": 0  # This would need to be calculated from goals table
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}") 