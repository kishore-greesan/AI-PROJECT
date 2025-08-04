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
            "role": "employee",
            "name": name
        }
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": new_user_id,
                "email": email,
                "role": "employee",
                "name": name
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
                "name": user["name"]
            })
        return jsonify(users_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False) 