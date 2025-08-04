from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class CompetencyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"

class SkillCategory(str, enum.Enum):
    TECHNICAL = "technical"
    SOFT_SKILLS = "soft_skills"
    LEADERSHIP = "leadership"
    DOMAIN_KNOWLEDGE = "domain_knowledge"
    TOOLS = "tools"

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(Enum(SkillCategory), nullable=False)
    competency_level = Column(Enum(CompetencyLevel), nullable=False)
    description = Column(Text, nullable=True)
    is_development_area = Column(String(5), default="false")  # SQLite doesn't support Boolean well
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="skills")
    
    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}', level='{self.competency_level}', user_id={self.user_id})>"
    
    @property
    def is_development_area_bool(self):
        return self.is_development_area.lower() == "true"
    
    @is_development_area_bool.setter
    def is_development_area_bool(self, value):
        self.is_development_area = str(value).lower() 