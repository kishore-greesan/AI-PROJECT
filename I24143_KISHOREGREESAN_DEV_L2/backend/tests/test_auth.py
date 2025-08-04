import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from app.models import Base, User, UserRole, Goal
from app.utils.security import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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
    # Import all models to ensure all tables are created
    import app.models  # Force model registration
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    db = TestingSessionLocal()
    hashed_password = get_password_hash("TestPassword123!")
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hashed_password,
        role=UserRole.EMPLOYEE
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

@pytest.fixture
def admin_token():
    db = TestingSessionLocal()
    hashed_password = get_password_hash("AdminPassword123!")
    admin = User(
        name="Admin User",
        email="admin@example.com",
        password_hash=hashed_password,
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    db.close()
    # Login as admin to get token
    response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "AdminPassword123!"
    })
    return response.json()["access_token"]

class TestAuthentication:
    def test_login_success(self, test_user):
        """Test successful login"""
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "TestPassword123!"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 900

    def test_login_invalid_email(self):
        """Test login with invalid email"""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "TestPassword123!"
        })
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"

    def test_login_invalid_password(self, test_user):
        """Test login with invalid password"""
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"

    def test_login_invalid_email_format(self):
        """Test login with invalid email format"""
        response = client.post("/api/auth/login", json={
            "email": "invalid-email",
            "password": "TestPassword123!"
        })
        
        assert response.status_code == 422

    def test_register_success(self, admin_token):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "NewPassword123!",
            "role": "employee"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New User"
        assert data["email"] == "newuser@example.com"
        assert data["role"] == "employee"

    def test_register_duplicate_email(self, test_user, admin_token):
        """Test registration with existing email"""
        response = client.post("/api/auth/register", json={
            "name": "Another User",
            "email": "test@example.com",
            "password": "AnotherPassword123!",
            "role": "employee"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 409
        assert response.json()["detail"] == "Email already registered"

    def test_register_weak_password(self, admin_token):
        """Test registration with weak password"""
        response = client.post("/api/auth/register", json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "weak",
            "role": "employee"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        
        assert response.status_code == 422

    def test_refresh_token_success(self, test_user):
        """Test successful token refresh"""
        # First login to get tokens
        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "TestPassword123!"
        })
        
        refresh_token = login_response.json()["refresh_token"]
        
        # Refresh token
        response = client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_token_invalid(self):
        """Test refresh with invalid token"""
        response = client.post("/api/auth/refresh", json={
            "refresh_token": "invalid-token"
        })
        
        assert response.status_code == 401

    def test_logout(self):
        """Test logout endpoint"""
        response = client.post("/api/auth/logout")
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "healthy" 