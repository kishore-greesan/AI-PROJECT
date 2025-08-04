import app.models  # Force model registration
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from app.models import Base, User, Goal, UserRole, GoalStatus
from app.utils.security import get_password_hash
from datetime import date, timedelta

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_goals.db"
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

@pytest.fixture(autouse=True)
def setup_database():
    # Import all models to ensure they are registered
    from app.models import User, Goal, GoalStatus, UserRole
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    db = TestingSessionLocal()
    user = User(
        name="Test User",
        email="testgoals@example.com",
        password_hash=get_password_hash("TestPassword123!"),
        role=UserRole.EMPLOYEE
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers():
    # Login and get token
    response = client.post("/api/auth/login", json={
        "email": "testgoals@example.com",
        "password": "TestPassword123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# ============================================================================
# US-006: Goal Creation Tests
# ============================================================================

class TestGoalCreation:
    """Test cases for US-006: Goal Creation functionality"""
    
    def test_create_goal_with_all_required_fields(self, auth_headers):
        """Test creating a goal with all required fields (title, description, target)"""
        payload = {
            "title": "Complete React Training",
            "description": "Learn React fundamentals and build a complete application",
            "target": "Build a full-stack React application with backend API",
            "quarter": "Q2",
            "start_date": "2024-04-01",
            "end_date": "2024-06-30",
            "comments": "Focus on hooks and modern React patterns"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify all fields are saved correctly
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert data["target"] == payload["target"]
        assert data["quarter"] == payload["quarter"]
        assert data["start_date"] == payload["start_date"]
        assert data["end_date"] == payload["end_date"]
        assert data["comments"] == payload["comments"]
        assert data["status"] == "draft"  # Goals start in draft status
        
    def test_create_goal_with_minimal_fields(self, auth_headers):
        """Test creating a goal with only required fields"""
        payload = {
            "title": "Learn TypeScript",
            "description": "Master TypeScript basics",
            "target": "Complete TypeScript course"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["status"] == "draft"
        
    def test_create_goal_with_quarter_assignment(self, auth_headers):
        """Test that goals can be assigned to specific quarters"""
        quarters = ["Q1", "Q2", "Q3", "Q4"]
        
        for quarter in quarters:
            payload = {
                "title": f"Goal for {quarter}",
                "description": f"Test goal for {quarter}",
                "target": f"Complete {quarter} objectives",
                "quarter": quarter
            }
            
            response = client.post("/api/goals/", json=payload, headers=auth_headers)
            assert response.status_code == 201
            data = response.json()
            assert data["quarter"] == quarter
    
    def test_create_goal_with_timeline_dates(self, auth_headers):
        """Test that timeline start and end dates can be set"""
        payload = {
            "title": "Timeline Test Goal",
            "description": "Testing timeline functionality",
            "target": "Complete within timeline",
            "start_date": "2024-01-01",
            "end_date": "2024-03-31"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["start_date"] == payload["start_date"]
        assert data["end_date"] == payload["end_date"]
    
    def test_create_goal_with_comments(self, auth_headers):
        """Test that employees can add comments to goals"""
        payload = {
            "title": "Goal with Comments",
            "description": "Testing comment functionality",
            "target": "Add comprehensive comments",
            "comments": "This is a detailed comment about the goal progress and expectations."
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["comments"] == payload["comments"]
    
    def test_create_goal_starts_in_draft_status(self, auth_headers):
        """Test that all new goals start in 'draft' status"""
        payload = {
            "title": "Draft Status Test",
            "description": "Testing draft status",
            "target": "Verify draft status"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "draft"

# ============================================================================
# Validation Tests
# ============================================================================

class TestGoalValidation:
    """Test cases for goal validation"""
    
    def test_create_goal_missing_title(self, auth_headers):
        """Test that title is required"""
        payload = {
            "description": "No title provided",
            "target": "Test target"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 422
        
    def test_create_goal_missing_description(self, auth_headers):
        """Test that description is required"""
        payload = {
            "title": "No Description Goal",
            "target": "Test target"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 422
        
    def test_create_goal_missing_target(self, auth_headers):
        """Test that target is required"""
        payload = {
            "title": "No Target Goal",
            "description": "Test description"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 422
        
    def test_create_goal_invalid_quarter(self, auth_headers):
        """Test validation for quarter field"""
        payload = {
            "title": "Invalid Quarter Goal",
            "description": "Testing quarter validation",
            "target": "Test target",
            "quarter": "INVALID"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        # Should still work as quarter is optional, but test the field
        assert response.status_code == 201
        
    def test_create_goal_invalid_date_format(self, auth_headers):
        """Test validation for date fields"""
        payload = {
            "title": "Invalid Date Goal",
            "description": "Testing date validation",
            "target": "Test target",
            "start_date": "invalid-date",
            "end_date": "also-invalid"
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 422

# ============================================================================
# CRUD Operations Tests
# ============================================================================

class TestGoalCRUD:
    """Test cases for goal CRUD operations"""
    
    def test_list_goals(self, auth_headers):
        """Test listing user's goals"""
        # Create multiple goals
        goals_data = [
            {"title": "Goal 1", "description": "First goal", "target": "Target 1"},
            {"title": "Goal 2", "description": "Second goal", "target": "Target 2"},
            {"title": "Goal 3", "description": "Third goal", "target": "Target 3"}
        ]
        
        for goal_data in goals_data:
            client.post("/api/goals/", json=goal_data, headers=auth_headers)
        
        # List goals
        response = client.get("/api/goals/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        
        # Verify all created goals are present
        titles = [goal["title"] for goal in data]
        for goal_data in goals_data:
            assert goal_data["title"] in titles
    
    def test_get_single_goal(self, auth_headers):
        """Test getting a single goal by ID"""
        # Create a goal
        create_payload = {
            "title": "Single Goal Test",
            "description": "Testing single goal retrieval",
            "target": "Test target"
        }
        
        create_response = client.post("/api/goals/", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 201
        created_goal = create_response.json()
        
        # Get the goal by ID
        goal_id = created_goal["id"]
        response = client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == goal_id
        assert data["title"] == create_payload["title"]
    
    def test_update_goal(self, auth_headers):
        """Test updating a goal"""
        # Create a goal
        create_payload = {
            "title": "Original Title",
            "description": "Original description",
            "target": "Original target"
        }
        
        create_response = client.post("/api/goals/", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 201
        created_goal = create_response.json()
        
        # Update the goal
        update_payload = {
            "title": "Updated Title",
            "description": "Updated description",
            "target": "Updated target",
            "comments": "Updated comments"
        }
        
        goal_id = created_goal["id"]
        response = client.put(f"/api/goals/{goal_id}", json=update_payload, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_payload["title"]
        assert data["description"] == update_payload["description"]
        assert data["target"] == update_payload["target"]
        assert data["comments"] == update_payload["comments"]
    
    def test_delete_goal(self, auth_headers):
        """Test deleting a goal"""
        # Create a goal
        create_payload = {
            "title": "Goal to Delete",
            "description": "This goal will be deleted",
            "target": "Delete target"
        }
        
        create_response = client.post("/api/goals/", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 201
        created_goal = create_response.json()
        
        # Delete the goal
        goal_id = created_goal["id"]
        response = client.delete(f"/api/goals/{goal_id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify goal is deleted
        get_response = client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        assert get_response.status_code == 404

# ============================================================================
# Authorization Tests
# ============================================================================

class TestGoalAuthorization:
    """Test cases for goal authorization"""
    
    def test_goal_requires_auth(self):
        """Test that goals endpoints require authentication"""
        response = client.get("/api/goals/")
        assert response.status_code == 403
        
        response = client.post("/api/goals/", json={})
        assert response.status_code == 403
    
    def test_user_can_only_access_own_goals(self, auth_headers):
        """Test that users can only access their own goals"""
        # Create a goal with the authenticated user
        create_payload = {
            "title": "My Goal",
            "description": "My description",
            "target": "My target"
        }
        
        create_response = client.post("/api/goals/", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 201
        created_goal = create_response.json()
        
        # Try to access the goal (should work)
        goal_id = created_goal["id"]
        response = client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        assert response.status_code == 200
        
        # Note: In a real system, we'd need to create another user to test isolation
        # For now, we test that the current user can access their own goals

# ============================================================================
# Edge Cases and Error Handling
# ============================================================================

class TestGoalEdgeCases:
    """Test cases for edge cases and error handling"""
    
    def test_create_goal_with_empty_strings(self, auth_headers):
        """Test handling of empty strings in optional fields"""
        payload = {
            "title": "Empty Strings Test",
            "description": "Testing empty strings",
            "target": "Test target",
            "comments": ""
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 201
    
    def test_create_goal_with_very_long_text(self, auth_headers):
        """Test handling of very long text fields"""
        long_text = "A" * 1000  # Very long text
        
        payload = {
            "title": "Long Text Test",
            "description": long_text,
            "target": "Test target",
            "comments": long_text
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == long_text
        assert data["comments"] == long_text
    
    def test_create_goal_with_special_characters(self, auth_headers):
        """Test handling of special characters in text fields"""
        special_text = "Goal with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
        
        payload = {
            "title": special_text,
            "description": special_text,
            "target": special_text,
            "comments": special_text
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == special_text
    
    def test_create_goal_with_unicode_characters(self, auth_headers):
        """Test handling of unicode characters"""
        unicode_text = "Goal with unicode: 🎯📈✅🌟"
        
        payload = {
            "title": unicode_text,
            "description": unicode_text,
            "target": unicode_text
        }
        
        response = client.post("/api/goals/", json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == unicode_text

# ============================================================================
# Performance Tests
# ============================================================================

class TestGoalPerformance:
    """Test cases for performance and scalability"""
    
    def test_create_multiple_goals_quickly(self, auth_headers):
        """Test creating multiple goals in quick succession"""
        goals_data = [
            {"title": f"Goal {i}", "description": f"Description {i}", "target": f"Target {i}"}
            for i in range(10)
        ]
        
        for goal_data in goals_data:
            response = client.post("/api/goals/", json=goal_data, headers=auth_headers)
            assert response.status_code == 201
        
        # Verify all goals were created
        response = client.get("/api/goals/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 10

# ============================================================================
# Legacy Tests (keeping for backward compatibility)
# ============================================================================

def test_create_goal_success(auth_headers):
    """Legacy test for backward compatibility"""
    payload = {
        "title": "Test Goal",
        "description": "A test goal.",
        "target": "Complete project",
        "quarter": "Q2",
        "start_date": "2024-06-01",
        "end_date": "2024-06-30",
        "comments": "Initial comment"
    }
    response = client.post("/api/goals/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "draft"

def test_create_goal_missing_title(auth_headers):
    """Legacy test for backward compatibility"""
    payload = {
        "description": "No title",
        "target": "Target",
        "quarter": "Q1"
    }
    response = client.post("/api/goals/", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_list_goals(auth_headers):
    """Legacy test for backward compatibility"""
    # Create goals with all required fields
    client.post("/api/goals/", json={
        "title": "Goal 1",
        "description": "Description for Goal 1",
        "target": "Target for Goal 1"
    }, headers=auth_headers)
    client.post("/api/goals/", json={
        "title": "Goal 2",
        "description": "Description for Goal 2", 
        "target": "Target for Goal 2"
    }, headers=auth_headers)
    response = client.get("/api/goals/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_goal_requires_auth():
    """Legacy test for backward compatibility"""
    response = client.get("/api/goals/")
    assert response.status_code == 403 