from flask import Flask, jsonify, request
from flask_cors import CORS
from app.database import engine
from app.models import Base, User
from sqlalchemy.orm import sessionmaker
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Simple user data for testing (in production, use database)
USERS = {
    "admin@test.com": {
        "id": 1,
        "email": "admin@test.com",
        "password": "Password123!",
        "role": "admin",
        "name": "Admin User"
    },
    "manager@test.com": {
        "id": 2,
        "email": "manager@test.com", 
        "password": "Password123!",
        "role": "manager",
        "name": "Manager User"
    },
    "employee@test.com": {
        "id": 3,
        "email": "employee@test.com",
        "password": "Password123!",
        "role": "employee",
        "name": "Employee User"
    }
}

# Simple token validation (in production, use JWT)
def get_user_from_token(token):
    if not token or not token.startswith('token_'):
        return None
    try:
        parts = token.split('_')
        if len(parts) >= 3:
            user_id = int(parts[1])
            role = parts[2]
            # Find user by ID and role
            for user in USERS.values():
                if user['id'] == user_id and user['role'] == role:
                    return user
    except:
        pass
    return None

@app.route("/")
def read_root():
    return jsonify({
        "message": "Welcome to Employee Performance Management System",
        "version": "1.0.0",
        "docs": "/docs"
    })

@app.route("/health")
def health_check():
    return jsonify({"status": "healthy", "message": "Employee Performance Management API is running"})

@app.route("/api/test")
def test_api():
    return jsonify({"message": "API is working!"})

@app.route("/api/debug")
def debug_info():
    return jsonify({
        "message": "Debug endpoint - new code deployed",
        "users_count": len(USERS),
        "available_users": list(USERS.keys())
    })

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = USERS.get(email)
        if not user or user["password"] != password:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Simple token (in production, use JWT)
        token = f"token_{user['id']}_{user['role']}"
        
        return jsonify({
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "name": user["name"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")
        role = data.get("role", "employee")
        department = data.get("department", "")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if email in USERS:
            return jsonify({"error": "User already exists"}), 400
        
        # Add new user (in production, save to database)
        new_user_id = len(USERS) + 1
        USERS[email] = {
            "id": new_user_id,
            "email": email,
            "password": password,
            "role": role,
            "name": name,
            "department": department
        }
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": new_user_id,
                "email": email,
                "role": role,
                "name": name,
                "department": department
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header required"}), 401
        
        token = auth_header.split(' ')[1]
        user = get_user_from_token(token)
        
        if not user:
            return jsonify({"error": "Invalid token"}), 401
        
        return jsonify({
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "name": user["name"],
            "department": user.get("department", "")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/me", methods=["GET"])
def get_my_profile():
    return get_current_user()

@app.route("/api/users", methods=["GET"])
def get_users():
    try:
        # Return list of users (without passwords)
        users_list = []
        for email, user in USERS.items():
            users_list.append({
                "id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "name": user["name"],
                "department": user.get("department", "")
            })
        return jsonify(users_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/goals", methods=["GET"])
def get_goals():
    # Mock goals data
    goals = [
        {
            "id": 1,
            "title": "Improve Team Collaboration",
            "description": "Enhance communication and teamwork",
            "status": "in_progress",
            "progress": 75,
            "due_date": "2024-12-31"
        },
        {
            "id": 2,
            "title": "Complete Project Milestone",
            "description": "Finish the current project phase",
            "status": "completed",
            "progress": 100,
            "due_date": "2024-11-30"
        }
    ]
    return jsonify(goals)

@app.route("/api/reports", methods=["GET"])
def get_reports():
    # Mock reports data
    reports = {
        "performance_summary": {
            "total_goals": 5,
            "completed_goals": 3,
            "average_progress": 80
        },
        "recent_activities": [
            {"date": "2024-01-15", "activity": "Goal completed"},
            {"date": "2024-01-10", "activity": "Review submitted"}
        ]
    }
    return jsonify(reports)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False) 