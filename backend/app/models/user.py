from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    REVIEWER = "reviewer"
    ADMIN = "admin"

class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    department = Column(String(50))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    appraiser_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(100), nullable=True)
    phone = Column(String(20))
    profile_picture = Column(String(500), nullable=True)  # URL to profile picture
    total_experience_years = Column(Integer, nullable=True)
    company_experience_years = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING, nullable=False)
    approved_by = Column(Integer, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    manager = relationship("User", remote_side=[id], foreign_keys=[manager_id], back_populates="direct_reports")
    direct_reports = relationship("User", foreign_keys=[manager_id], back_populates="manager")
    appraiser = relationship("User", remote_side=[id], foreign_keys=[appraiser_id], back_populates="appraisees")
    appraisees = relationship("User", foreign_keys=[appraiser_id], back_populates="appraiser")
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>" 