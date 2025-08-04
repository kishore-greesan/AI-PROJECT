from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.skill import Skill, CompetencyLevel, SkillCategory
from app.models.user import User
from app.schemas.skill import (
    SkillCreate, 
    SkillUpdate, 
    SkillResponse, 
    SkillListResponse,
    SkillAnalytics,
    SkillCategoryResponse
)
from app.utils.security import get_current_user, verify_token

router = APIRouter()

@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new skill for the current user"""
    try:
        # Check if skill with same name already exists for this user
        existing_skill = db.query(Skill).filter(
            Skill.user_id == current_user.id,
            Skill.name.ilike(skill_data.name)
        ).first()
        
        if existing_skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Skill with this name already exists"
            )
        
        # Create new skill
        skill = Skill(
            user_id=current_user.id,
            name=skill_data.name,
            category=skill_data.category,
            competency_level=skill_data.competency_level,
            description=skill_data.description,
            is_development_area=str(skill_data.is_development_area).lower(),
            tags=skill_data.tags
        )
        
        db.add(skill)
        db.commit()
        db.refresh(skill)
        
        return skill
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create skill: {str(e)}"
        )

@router.get("/", response_model=SkillListResponse)
async def get_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    category: Optional[SkillCategory] = Query(None, description="Filter by category"),
    level: Optional[CompetencyLevel] = Query(None, description="Filter by competency level"),
    development_area: Optional[bool] = Query(None, description="Filter by development area")
):
    """Get skills for the current user with optional filtering"""
    try:
        query = db.query(Skill).filter(Skill.user_id == current_user.id)
        
        # Apply filters
        if category:
            query = query.filter(Skill.category == category)
        if level:
            query = query.filter(Skill.competency_level == level)
        if development_area is not None:
            query = query.filter(Skill.is_development_area == str(development_area).lower())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        skills = query.offset((page - 1) * size).limit(size).all()
        
        return SkillListResponse(
            skills=skills,
            total=total,
            page=page,
            size=size
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skills: {str(e)}"
        )

@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific skill by ID"""
    try:
        skill = db.query(Skill).filter(
            Skill.id == skill_id,
            Skill.user_id == current_user.id
        ).first()
        
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        return skill
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skill: {str(e)}"
        )

@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a skill"""
    try:
        skill = db.query(Skill).filter(
            Skill.id == skill_id,
            Skill.user_id == current_user.id
        ).first()
        
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        # Check if name is being updated and if it conflicts with existing skill
        if skill_data.name and skill_data.name != skill.name:
            existing_skill = db.query(Skill).filter(
                Skill.user_id == current_user.id,
                Skill.name.ilike(skill_data.name),
                Skill.id != skill_id
            ).first()
            
            if existing_skill:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Skill with this name already exists"
                )
        
        # Update skill fields
        update_data = skill_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "is_development_area":
                setattr(skill, field, str(value).lower())
            else:
                setattr(skill, field, value)
        
        db.commit()
        db.refresh(skill)
        
        return skill
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update skill: {str(e)}"
        )

@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a skill"""
    try:
        skill = db.query(Skill).filter(
            Skill.id == skill_id,
            Skill.user_id == current_user.id
        ).first()
        
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        db.delete(skill)
        db.commit()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete skill: {str(e)}"
        )

@router.get("/analytics/summary", response_model=SkillAnalytics)
async def get_skill_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skill analytics for the current user"""
    try:
        skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
        
        total_skills = len(skills)
        development_areas = len([s for s in skills if s.is_development_area_bool])
        expert_skills = len([s for s in skills if s.competency_level == CompetencyLevel.EXPERT])
        intermediate_skills = len([s for s in skills if s.competency_level == CompetencyLevel.INTERMEDIATE])
        beginner_skills = len([s for s in skills if s.competency_level == CompetencyLevel.BEGINNER])
        
        # Category breakdown
        category_breakdown = []
        for category in SkillCategory:
            category_skills = [s for s in skills if s.category == category]
            if category_skills:
                # Calculate average level
                level_scores = {
                    CompetencyLevel.BEGINNER: 1,
                    CompetencyLevel.INTERMEDIATE: 2,
                    CompetencyLevel.EXPERT: 3
                }
                avg_score = sum(level_scores[s.competency_level] for s in category_skills) / len(category_skills)
                
                if avg_score >= 2.5:
                    avg_level = "expert"
                elif avg_score >= 1.5:
                    avg_level = "intermediate"
                else:
                    avg_level = "beginner"
                
                category_breakdown.append(SkillCategoryResponse(
                    category=category,
                    count=len(category_skills),
                    average_level=avg_level
                ))
        
        return SkillAnalytics(
            total_skills=total_skills,
            development_areas=development_areas,
            expert_skills=expert_skills,
            intermediate_skills=intermediate_skills,
            beginner_skills=beginner_skills,
            category_breakdown=category_breakdown
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skill analytics: {str(e)}"
        ) 