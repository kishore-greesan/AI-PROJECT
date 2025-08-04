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
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

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

# Mock data for other endpoints
GOALS = [
    {
        "id": 1,
        "title": "Improve Team Collaboration",
        "description": "Enhance communication and teamwork",
        "status": "in_progress",
        "progress": 75,
        "due_date": "2024-12-31",
        "user_id": 3
    },
    {
        "id": 2,
        "title": "Complete Project Milestone",
        "description": "Finish the current project phase",
        "status": "completed",
        "progress": 100,
        "due_date": "2024-11-30",
        "user_id": 3
    }
]

REVIEWS = [
    {
        "id": 1,
        "goal_id": 1,
        "reviewer_id": 2,
        "rating": 4,
        "comments": "Good progress on team collaboration",
        "status": "completed"
    }
]

NOTIFICATIONS = [
    {
        "id": 1,
        "title": "New user registered",
        "message": "john@company.com has registered",
        "type": "info",
        "read": False,
        "created_at": "2024-01-15T10:30:00Z"
    },
    {
        "id": 2,
        "title": "Goal completed",
        "message": "jane@company.com completed a goal",
        "type": "success",
        "read": False,
        "created_at": "2024-01-15T08:15:00Z"
    },
    {
        "id": 3,
        "title": "Performance review submitted",
        "message": "mike@company.com submitted a review",
        "type": "warning",
        "read": True,
        "created_at": "2024-01-15T06:45:00Z"
    }
]

PENDING_REGISTRATIONS = []

# Mock organizational data
ORG_HIERARCHY = {
    "departments": [
        {
            "id": 1,
            "name": "Engineering",
            "description": "Software development and technical operations",
            "teams": [
                {"id": 1, "name": "Frontend Team", "members": 5},
                {"id": 2, "name": "Backend Team", "members": 4},
                {"id": 3, "name": "DevOps Team", "members": 3}
            ]
        },
        {
            "id": 2,
            "name": "Marketing",
            "description": "Brand management and customer acquisition",
            "teams": [
                {"id": 4, "name": "Digital Marketing", "members": 3},
                {"id": 5, "name": "Content Team", "members": 2}
            ]
        },
        {
            "id": 3,
            "name": "Sales",
            "description": "Customer acquisition and revenue generation",
            "teams": [
                {"id": 6, "name": "Enterprise Sales", "members": 4},
                {"id": 7, "name": "SMB Sales", "members": 3}
            ]
        }
    ]
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

# Auth endpoints
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

@app.route("/api/auth/refresh", methods=["POST"])
def refresh_token():
    return jsonify({"message": "Token refreshed"})

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully"})

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

# User endpoints
@app.route("/api/users/me", methods=["GET"])
def get_my_profile():
    return get_current_user()

@app.route("/api/users/me", methods=["PUT"])
def update_my_profile():
    try:
        data = request.get_json()
        return jsonify({"message": "Profile updated successfully", "data": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/", methods=["GET"])
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

@app.route("/api/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
def manage_user(user_id):
    if request.method == "GET":
        for user in USERS.values():
            if user["id"] == user_id:
                return jsonify(user)
        return jsonify({"error": "User not found"}), 404
    
    elif request.method == "PUT":
        try:
            data = request.get_json()
            for email, user in USERS.items():
                if user["id"] == user_id:
                    user.update(data)
                    return jsonify({"message": "User updated successfully", "user": user})
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == "DELETE":
        try:
            for email, user in list(USERS.items()):
                if user["id"] == user_id:
                    del USERS[email]
                    return jsonify({"message": "User deleted successfully"})
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>/approve", methods=["POST"])
def approve_user(user_id):
    try:
        data = request.get_json()
        approval_status = data.get("approval_status")
        reason = data.get("reason", "")
        
        # Find user by ID
        user = None
        for email, u in USERS.items():
            if u["id"] == user_id:
                user = u
                break
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update user approval status
        user["approval_status"] = approval_status
        if reason:
            user["rejection_reason"] = reason
        
        return jsonify({
            "message": f"User {approval_status} successfully",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "approval_status": approval_status
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/reviewers", methods=["GET"])
def get_reviewers():
    reviewers = [user for user in USERS.values() if user["role"] in ["admin", "manager"]]
    return jsonify(reviewers)

@app.route("/api/users/employees", methods=["GET"])
def get_employees():
    employees = [user for user in USERS.values() if user["role"] == "employee"]
    return jsonify(employees)

# Profile endpoints
@app.route("/api/profile/user-profile", methods=["GET"])
def get_user_profile():
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
            "name": user["name"],
            "role": user["role"],
            "department": user.get("department", "Not assigned"),
            "team": "Not assigned",
            "title": "Not specified",
            "phone": "Not specified",
            "manager": "Not assigned",
            "years_experience": 0,
            "company_years": 0,
            "direct_reports": 0,
            "active_goals": len([g for g in GOALS if g["user_id"] == user["id"] and g["status"] == "in_progress"])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/org-hierarchy", methods=["GET"])
def get_org_hierarchy():
    return jsonify(ORG_HIERARCHY)

# Notifications endpoints
@app.route("/api/notifications/", methods=["GET"])
def get_notifications():
    limit = request.args.get('limit', 10, type=int)
    return jsonify(NOTIFICATIONS[:limit])

@app.route("/api/notifications/unread-count", methods=["GET"])
def get_unread_count():
    unread_count = len([n for n in NOTIFICATIONS if not n["read"]])
    return jsonify({"unread_count": unread_count})

@app.route("/api/notifications/<int:notification_id>", methods=["PUT"])
def mark_notification_read(notification_id):
    notification = next((n for n in NOTIFICATIONS if n["id"] == notification_id), None)
    if notification:
        notification["read"] = True
        return jsonify({"message": "Notification marked as read"})
    return jsonify({"error": "Notification not found"}), 404

@app.route("/api/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_notification_read_alt(notification_id):
    return mark_notification_read(notification_id)

# Pending registrations endpoint
@app.route("/api/pending-registrations", methods=["GET"])
def get_pending_registrations():
    return jsonify(PENDING_REGISTRATIONS)

# Goals endpoints
@app.route("/api/goals/", methods=["GET"])
def get_goals():
    return jsonify(GOALS)

@app.route("/api/goals/all", methods=["GET"])
def get_all_goals():
    return jsonify(GOALS)

@app.route("/api/goals/<int:goal_id>", methods=["GET"])
def get_goal_by_id(goal_id):
    goal = next((g for g in GOALS if g["id"] == goal_id), None)
    if goal:
        return jsonify(goal)
    return jsonify({"error": "Goal not found"}), 404

@app.route("/api/goals/", methods=["POST"])
def create_goal():
    try:
        data = request.get_json()
        new_goal = {
            "id": len(GOALS) + 1,
            **data,
            "status": "in_progress",
            "progress": 0
        }
        GOALS.append(new_goal)
        return jsonify(new_goal)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    try:
        data = request.get_json()
        goal = next((g for g in GOALS if g["id"] == goal_id), None)
        if goal:
            goal.update(data)
            return jsonify(goal)
        return jsonify({"error": "Goal not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    global GOALS
    GOALS = [g for g in GOALS if g["id"] != goal_id]
    return jsonify({"message": "Goal deleted successfully"})

@app.route("/api/goals/submit-for-review", methods=["POST"])
def submit_goals_for_review():
    try:
        data = request.get_json()
        return jsonify({"message": "Goals submitted for review"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/goals/<int:goal_id>/progress", methods=["GET"])
def get_goal_progress(goal_id):
    goal = next((g for g in GOALS if g["id"] == goal_id), None)
    if goal:
        return jsonify({"progress": goal.get("progress", 0)})
    return jsonify({"error": "Goal not found"}), 404

@app.route("/api/goals/<int:goal_id>/progress", methods=["POST"])
def update_goal_progress(goal_id):
    try:
        data = request.get_json()
        goal = next((g for g in GOALS if g["id"] == goal_id), None)
        if goal:
            goal["progress"] = data.get("progress", goal.get("progress", 0))
            return jsonify(goal)
        return jsonify({"error": "Goal not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/goals/review", methods=["GET"])
def get_goals_for_review():
    return jsonify([g for g in GOALS if g["status"] == "pending_review"])

@app.route("/api/goals/<int:goal_id>/review", methods=["POST"])
def review_goal(goal_id):
    try:
        data = request.get_json()
        return jsonify({"message": "Goal reviewed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Reviews endpoints
@app.route("/api/reviews/", methods=["POST"])
def create_review():
    try:
        data = request.get_json()
        new_review = {
            "id": len(REVIEWS) + 1,
            **data
        }
        REVIEWS.append(new_review)
        return jsonify(new_review)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reviews/", methods=["GET"])
def get_reviews():
    return jsonify(REVIEWS)

@app.route("/api/reviews/<int:review_id>", methods=["GET"])
def get_review_by_id(review_id):
    review = next((r for r in REVIEWS if r["id"] == review_id), None)
    if review:
        return jsonify(review)
    return jsonify({"error": "Review not found"}), 404

@app.route("/api/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    try:
        data = request.get_json()
        review = next((r for r in REVIEWS if r["id"] == review_id), None)
        if review:
            review.update(data)
            return jsonify(review)
        return jsonify({"error": "Review not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    global REVIEWS
    REVIEWS = [r for r in REVIEWS if r["id"] != review_id]
    return jsonify({"message": "Review deleted successfully"})

@app.route("/api/reviews/comparison/<int:goal_id>", methods=["GET"])
def get_review_comparison(goal_id):
    return jsonify({"comparison": "Review comparison data"})

@app.route("/api/reviews/summary/", methods=["GET"])
def get_reviews_summary():
    return jsonify({"summary": "Reviews summary data"})

# Reports endpoints
@app.route("/api/reports/admin/overview", methods=["GET"])
def get_admin_overview():
    return jsonify({
        "total_users": len(USERS),
        "total_goals": len(GOALS),
        "completed_goals": len([g for g in GOALS if g["status"] == "completed"]),
        "pending_reviews": len([g for g in GOALS if g["status"] == "pending_review"])
    })

@app.route("/api/reports/admin/department-stats", methods=["GET"])
def get_department_stats():
    return jsonify({
        "departments": [
            {"name": "Engineering", "users": 5, "goals": 12},
            {"name": "Marketing", "users": 3, "goals": 8},
            {"name": "Sales", "users": 4, "goals": 10}
        ]
    })

@app.route("/api/reports/manager/team-overview", methods=["GET"])
def get_manager_team_overview():
    return jsonify({
        "team_size": 5,
        "active_goals": 8,
        "completed_goals": 3,
        "average_progress": 75
    })

@app.route("/api/reports/manager/team-members", methods=["GET"])
def get_team_members():
    employees = [user for user in USERS.values() if user["role"] == "employee"]
    return jsonify(employees)

@app.route("/api/reports/trends/goal-progress", methods=["GET"])
def get_goal_progress_trends():
    return jsonify({
        "trends": [
            {"month": "Jan", "progress": 65},
            {"month": "Feb", "progress": 72},
            {"month": "Mar", "progress": 78}
        ]
    })

@app.route("/api/reports/skills/competency-matrix", methods=["GET"])
def get_competency_matrix():
    return jsonify({
        "matrix": [
            {"skill": "Leadership", "level": 4, "target": 5},
            {"skill": "Communication", "level": 3, "target": 4},
            {"skill": "Technical", "level": 5, "target": 5}
        ]
    })

@app.route("/api/goals", methods=["GET"])
def get_goals_simple():
    return jsonify(GOALS)

@app.route("/api/reports", methods=["GET"])
def get_reports_simple():
    return jsonify({
        "performance_summary": {
            "total_goals": len(GOALS),
            "completed_goals": len([g for g in GOALS if g["status"] == "completed"]),
            "average_progress": sum(g.get("progress", 0) for g in GOALS) / len(GOALS) if GOALS else 0
        },
        "recent_activities": [
            {"date": "2024-01-15", "activity": "Goal completed"},
            {"date": "2024-01-10", "activity": "Review submitted"}
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False) 