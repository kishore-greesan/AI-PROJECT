import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.models.user import User, UserRole
from app.models.skill import Skill, CompetencyLevel, SkillCategory
from app.utils.security import get_password_hash
import json

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_skills.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def test_user(setup_database):
    """Create a test user"""
    db = TestingSessionLocal()
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.EMPLOYEE,
        department="Engineering"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

@pytest.fixture(scope="function")
def auth_headers(test_user):
    """Get authentication headers for test user"""
    login_response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

class TestSkillCreation:
    """Test skill creation functionality"""
    
    def test_create_skill_success(self, auth_headers):
        """Test successful skill creation"""
        skill_data = {
            "name": "Python Programming",
            "category": "technical",
            "competency_level": "intermediate",
            "description": "Python development skills",
            "is_development_area": False,
            "tags": "python, programming, backend"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Python Programming"
        assert data["category"] == "technical"
        assert data["competency_level"] == "intermediate"
        assert data["description"] == "Python development skills"
        assert data["is_development_area"] == False
        assert data["tags"] == "python, programming, backend"
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_skill_duplicate_name(self, auth_headers):
        """Test creating skill with duplicate name"""
        skill_data = {
            "name": "JavaScript",
            "category": "technical",
            "competency_level": "beginner",
            "description": "Frontend development"
        }
        
        # Create first skill
        client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        # Try to create duplicate
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_create_skill_invalid_data(self, auth_headers):
        """Test creating skill with invalid data"""
        skill_data = {
            "name": "",  # Empty name
            "category": "invalid_category",
            "competency_level": "invalid_level"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        assert response.status_code == 422  # Validation error
    
    def test_create_skill_unauthorized(self):
        """Test creating skill without authentication"""
        skill_data = {
            "name": "Python Programming",
            "category": "technical",
            "competency_level": "intermediate"
        }
        
        response = client.post("/api/skills/", json=skill_data)
        
        assert response.status_code == 401

class TestSkillRetrieval:
    """Test skill retrieval functionality"""
    
    def test_get_skills_empty(self, auth_headers):
        """Test getting skills when user has none"""
        response = client.get("/api/skills/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["skills"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["size"] == 10
    
    def test_get_skills_with_data(self, auth_headers):
        """Test getting skills with existing data"""
        # Create some skills
        skills_data = [
            {
                "name": "Python Programming",
                "category": "technical",
                "competency_level": "intermediate",
                "description": "Python development"
            },
            {
                "name": "Leadership",
                "category": "leadership",
                "competency_level": "beginner",
                "description": "Team leadership skills"
            }
        ]
        
        for skill_data in skills_data:
            client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        response = client.get("/api/skills/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["skills"]) == 2
        assert data["total"] == 2
    
    def test_get_skills_with_filters(self, auth_headers):
        """Test getting skills with filters"""
        # Create skills with different categories
        skills_data = [
            {
                "name": "Python Programming",
                "category": "technical",
                "competency_level": "intermediate"
            },
            {
                "name": "Leadership",
                "category": "leadership",
                "competency_level": "beginner"
            }
        ]
        
        for skill_data in skills_data:
            client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        # Filter by category
        response = client.get("/api/skills/?category=technical", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["skills"]) == 1
        assert data["skills"][0]["category"] == "technical"
        
        # Filter by competency level
        response = client.get("/api/skills/?level=beginner", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["skills"]) == 1
        assert data["skills"][0]["competency_level"] == "beginner"
    
    def test_get_skill_by_id(self, auth_headers):
        """Test getting a specific skill by ID"""
        skill_data = {
            "name": "Python Programming",
            "category": "technical",
            "competency_level": "intermediate"
        }
        
        create_response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        skill_id = create_response.json()["id"]
        
        response = client.get(f"/api/skills/{skill_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == skill_id
        assert data["name"] == "Python Programming"
    
    def test_get_skill_not_found(self, auth_headers):
        """Test getting non-existent skill"""
        response = client.get("/api/skills/999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

class TestSkillUpdate:
    """Test skill update functionality"""
    
    def test_update_skill_success(self, auth_headers):
        """Test successful skill update"""
        # Create a skill
        skill_data = {
            "name": "Python Programming",
            "category": "technical",
            "competency_level": "beginner"
        }
        
        create_response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        skill_id = create_response.json()["id"]
        
        # Update the skill
        update_data = {
            "competency_level": "expert",
            "description": "Advanced Python programming skills"
        }
        
        response = client.put(f"/api/skills/{skill_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["competency_level"] == "expert"
        assert data["description"] == "Advanced Python programming skills"
        assert data["name"] == "Python Programming"  # Should remain unchanged
    
    def test_update_skill_not_found(self, auth_headers):
        """Test updating non-existent skill"""
        update_data = {"name": "Updated Skill"}
        
        response = client.put("/api/skills/999", json=update_data, headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
    
    def test_update_skill_duplicate_name(self, auth_headers):
        """Test updating skill with duplicate name"""
        # Create two skills
        skill1_data = {"name": "Python", "category": "technical", "competency_level": "beginner"}
        skill2_data = {"name": "JavaScript", "category": "technical", "competency_level": "beginner"}
        
        client.post("/api/skills/", json=skill1_data, headers=auth_headers)
        create_response = client.post("/api/skills/", json=skill2_data, headers=auth_headers)
        skill2_id = create_response.json()["id"]
        
        # Try to update skill2 with skill1's name
        update_data = {"name": "Python"}
        response = client.put(f"/api/skills/{skill2_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

class TestSkillDeletion:
    """Test skill deletion functionality"""
    
    def test_delete_skill_success(self, auth_headers):
        """Test successful skill deletion"""
        # Create a skill
        skill_data = {
            "name": "Python Programming",
            "category": "technical",
            "competency_level": "intermediate"
        }
        
        create_response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        skill_id = create_response.json()["id"]
        
        # Delete the skill
        response = client.delete(f"/api/skills/{skill_id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify skill is deleted
        get_response = client.get(f"/api/skills/{skill_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_skill_not_found(self, auth_headers):
        """Test deleting non-existent skill"""
        response = client.delete("/api/skills/999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

class TestSkillAnalytics:
    """Test skill analytics functionality"""
    
    def test_get_skill_analytics_empty(self, auth_headers):
        """Test analytics when user has no skills"""
        response = client.get("/api/skills/analytics/summary", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_skills"] == 0
        assert data["development_areas"] == 0
        assert data["expert_skills"] == 0
        assert data["intermediate_skills"] == 0
        assert data["beginner_skills"] == 0
        assert len(data["category_breakdown"]) == 0
    
    def test_get_skill_analytics_with_data(self, auth_headers):
        """Test analytics with existing skills"""
        # Create skills with different levels and categories
        skills_data = [
            {
                "name": "Python Programming",
                "category": "technical",
                "competency_level": "expert",
                "is_development_area": False
            },
            {
                "name": "Leadership",
                "category": "leadership",
                "competency_level": "beginner",
                "is_development_area": True
            },
            {
                "name": "JavaScript",
                "category": "technical",
                "competency_level": "intermediate",
                "is_development_area": False
            }
        ]
        
        for skill_data in skills_data:
            client.post("/api/skills/", json=skill_data, headers=auth_headers)
        
        response = client.get("/api/skills/analytics/summary", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_skills"] == 3
        assert data["development_areas"] == 1
        assert data["expert_skills"] == 1
        assert data["intermediate_skills"] == 1
        assert data["beginner_skills"] == 1
        assert len(data["category_breakdown"]) == 2  # technical and leadership
        
        # Check category breakdown
        technical_category = next(cat for cat in data["category_breakdown"] if cat["category"] == "technical")
        assert technical_category["count"] == 2
        assert technical_category["average_level"] == "intermediate"  # (expert + intermediate) / 2
        
        leadership_category = next(cat for cat in data["category_breakdown"] if cat["category"] == "leadership")
        assert leadership_category["count"] == 1
        assert leadership_category["average_level"] == "beginner"

class TestSkillValidation:
    """Test skill validation rules"""
    
    def test_skill_name_validation(self, auth_headers):
        """Test skill name validation"""
        # Test empty name
        skill_data = {
            "name": "",
            "category": "technical",
            "competency_level": "intermediate"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test name too long
        skill_data = {
            "name": "a" * 101,  # 101 characters
            "category": "technical",
            "competency_level": "intermediate"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        assert response.status_code == 422
    
    def test_skill_category_validation(self, auth_headers):
        """Test skill category validation"""
        skill_data = {
            "name": "Test Skill",
            "category": "invalid_category",
            "competency_level": "intermediate"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        assert response.status_code == 422
    
    def test_competency_level_validation(self, auth_headers):
        """Test competency level validation"""
        skill_data = {
            "name": "Test Skill",
            "category": "technical",
            "competency_level": "invalid_level"
        }
        
        response = client.post("/api/skills/", json=skill_data, headers=auth_headers)
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 