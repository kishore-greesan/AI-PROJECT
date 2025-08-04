from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CompetencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"

class SkillCategory(str, Enum):
    TECHNICAL = "technical"
    SOFT_SKILLS = "soft_skills"
    LEADERSHIP = "leadership"
    DOMAIN_KNOWLEDGE = "domain_knowledge"
    TOOLS = "tools"

class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Skill name")
    category: SkillCategory = Field(..., description="Skill category")
    competency_level: CompetencyLevel = Field(..., description="Competency level")
    description: Optional[str] = Field(None, max_length=1000, description="Skill description")
    is_development_area: bool = Field(False, description="Whether this is a development area")
    tags: Optional[str] = Field(None, max_length=500, description="Comma-separated tags")

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[SkillCategory] = None
    competency_level: Optional[CompetencyLevel] = None
    description: Optional[str] = Field(None, max_length=1000)
    is_development_area: Optional[bool] = None
    tags: Optional[str] = Field(None, max_length=500)

class SkillResponse(SkillBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SkillListResponse(BaseModel):
    skills: List[SkillResponse]
    total: int
    page: int
    size: int

class SkillCategoryResponse(BaseModel):
    category: SkillCategory
    count: int
    average_level: str

class SkillAnalytics(BaseModel):
    total_skills: int
    development_areas: int
    expert_skills: int
    intermediate_skills: int
    beginner_skills: int
    category_breakdown: List[SkillCategoryResponse] 