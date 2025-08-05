# Employee Performance Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Overview

The Employee Performance Management System API provides RESTful endpoints for managing employee performance, goals, reviews, and organizational hierarchy. The API supports role-based access control with three user roles: Admin, Reviewer/Manager, and Employee.

### Features
- **User Management**: Registration, authentication, profile management
- **Goal Management**: Goal setting, tracking, and review workflows
- **Performance Reviews**: Multi-stage review process with feedback
- **Reporting**: Comprehensive analytics and reporting
- **Notifications**: Real-time notification system
- **Approval Workflows**: Pending registration approvals

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

### Authentication Flow
1. **Login**: `POST /api/auth/login` to obtain JWT token
2. **Include Token**: Add `Authorization: Bearer <token>` header
3. **Refresh**: Use `POST /api/auth/refresh` to refresh expired tokens

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://emps-backend.onrender.com`

---

## API Endpoints

### 1. Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "employee"
  }
}
```

#### POST /api/auth/register
Register a new user (creates pending registration).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "New User",
  "role": "employee",
  "department": "Engineering",
  "title": "Software Engineer",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Pending approval.",
  "user": {
    "id": 4,
    "email": "newuser@example.com",
    "name": "New User",
    "role": "employee",
    "approval_status": "pending"
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "employee",
  "department": "Engineering",
  "manager_id": 2,
  "appraiser_id": 2
}
```

#### POST /api/auth/refresh
Refresh JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### POST /api/auth/logout
Logout user (client-side token removal).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### 2. User Management Endpoints

#### GET /api/users/
Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Engineering",
    "title": "Software Engineer",
    "approval_status": "approved"
  }
]
```

#### GET /api/users/{user_id}
Get specific user details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "department": "Engineering",
  "title": "Software Engineer",
  "manager_id": 2,
  "appraiser_id": 2,
  "approval_status": "approved"
}
```

#### PUT /api/users/{user_id}
Update user information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "department": "Engineering",
  "title": "Senior Software Engineer",
  "phone": "+1-555-0124"
}
```

#### DELETE /api/users/{user_id}
Delete user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

#### GET /api/users/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

#### PUT /api/users/me
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1-555-0123",
  "title": "Software Engineer"
}
```

#### GET /api/users/reviewers
Get all reviewers/managers.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 2,
    "name": "Manager User",
    "email": "manager@example.com",
    "role": "reviewer",
    "department": "Engineering"
  }
]
```

#### GET /api/users/employees
Get all employees.

**Headers:** `Authorization: Bearer <token>`

#### POST /api/users/{user_id}/approve
Approve or reject pending user registration.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "action": "approve"  // or "reject"
}
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "id": 4,
    "email": "newuser@example.com",
    "name": "New User",
    "approval_status": "approved"
  }
}
```

#### GET /api/pending-registrations
Get all pending user registrations (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 4,
    "email": "newuser@example.com",
    "name": "New User",
    "role": "employee",
    "department": "Engineering",
    "title": "Software Engineer",
    "phone": "+1-555-0123",
    "created_at": "2024-01-15T10:30:00Z",
    "approval_status": "pending"
  }
]
```

### 3. Goal Management Endpoints

#### GET /api/goals/
Get current user's goals.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Improve Code Quality",
    "description": "Reduce bug count by 50%",
    "target": "50% reduction",
    "quarter": "Q1 2024",
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "status": "draft",
    "progress": 25.50,
    "reviewer_id": 2
  }
]
```

#### GET /api/goals/all
Get all goals (Admin only).

**Headers:** `Authorization: Bearer <token>`

#### GET /api/goals/{goal_id}
Get specific goal details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "title": "Improve Code Quality",
  "description": "Reduce bug count by 50%",
  "target": "50% reduction",
  "quarter": "Q1 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "status": "draft",
  "progress": 25.50,
  "reviewer_id": 2,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST /api/goals/
Create new goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Improve Code Quality",
  "description": "Reduce bug count by 50%",
  "target": "50% reduction",
  "quarter": "Q1 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Improve Code Quality",
  "description": "Reduce bug count by 50%",
  "status": "draft",
  "progress": 0.00
}
```

#### PUT /api/goals/{goal_id}
Update goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Improve Code Quality Updated",
  "description": "Reduce bug count by 60%",
  "target": "60% reduction"
}
```

#### DELETE /api/goals/{goal_id}
Delete goal.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Goal deleted successfully"
}
```

#### POST /api/goals/submit_all
Submit all draft goals for review.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Goals submitted for review",
  "submitted_count": 3
}
```

#### GET /api/goals/history
Get goal history and progress tracking.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "goal_id": 1,
    "progress": 25.50,
    "comments": "Making good progress",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/goals/{goal_id}/progress
Get goal progress details.

**Headers:** `Authorization: Bearer <token>`

#### POST /api/goals/{goal_id}/progress
Update goal progress.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "progress": 50.00,
  "comments": "Halfway through the goal"
}
```

#### GET /api/goals/review
Get goals pending review (Reviewer only).

**Headers:** `Authorization: Bearer <token>`

#### POST /api/goals/{goal_id}/review
Review specific goal (Reviewer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "approved",
  "comments": "Good goal, approved"
}
```

### 4. Review Management Endpoints

#### GET /api/reviews/
Get all reviews.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "employee_id": 1,
    "reviewer_id": 2,
    "goal_id": 1,
    "review_type": "performance_review",
    "rating": 4,
    "comments": "Good performance",
    "status": "submitted",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/reviews/
Create new review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "employee_id": 1,
  "goal_id": 1,
  "review_type": "performance_review",
  "rating": 4,
  "comments": "Good performance",
  "strengths": "Strong technical skills",
  "areas_for_improvement": "Communication skills",
  "action_plan": "Attend communication workshop"
}
```

#### GET /api/reviews/{review_id}
Get specific review details.

**Headers:** `Authorization: Bearer <token>`

#### PUT /api/reviews/{review_id}
Update review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5,
  "comments": "Excellent performance",
  "status": "finalized"
}
```

#### DELETE /api/reviews/{review_id}
Delete review.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/reviews/comparison/{goal_id}
Get review comparison for specific goal.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/reviews/summary/
Get review summary statistics.

**Headers:** `Authorization: Bearer <token>`

### 5. Reports Endpoints

#### GET /api/reports/admin/overview
Get admin overview dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_users": 25,
  "total_goals": 150,
  "pending_reviews": 12,
  "completed_reviews": 45,
  "user_distribution": {
    "admin": 2,
    "reviewer": 8,
    "employee": 15
  },
  "goal_status_distribution": {
    "draft": 30,
    "submitted": 20,
    "approved": 80,
    "completed": 20
  }
}
```

#### GET /api/reports/admin/department-stats
Get department statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "department": "Engineering",
    "total_employees": 10,
    "average_rating": 4.2,
    "goals_completed": 25,
    "goals_in_progress": 15
  }
]
```

#### GET /api/reports/manager/team-overview
Get manager team overview.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/reports/manager/team-members
Get team members for manager.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/reports/trends/goal-progress
Get goal progress trends.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "month": "2024-01",
    "average_progress": 45.5,
    "goals_count": 25
  }
]
```

#### GET /api/reports/skills/competency-matrix
Get competency matrix.

**Headers:** `Authorization: Bearer <token>`

### 6. Notification Endpoints

#### GET /api/notifications/
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "type": "goal_review",
    "title": "Goal Review Required",
    "message": "You have a goal pending review",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/notifications/unread-count
Get unread notification count.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "unread_count": 5
}
```

#### PUT /api/notifications/{notification_id}/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

#### PUT /api/notifications/mark-all-read
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### 7. Manager-Specific Endpoints

#### GET /api/manager/team-members
Get team members for manager.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/manager/pending-reviews
Get pending reviews for manager.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/manager/team-performance
Get team performance metrics.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/manager/recent-activity
Get recent team activity.

**Headers:** `Authorization: Bearer <token>`

### 8. Profile Endpoints

#### GET /api/profile/user-profile
Get user profile information.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/profile/org-hierarchy
Get organizational hierarchy.

**Headers:** `Authorization: Bearer <token>`

---

## Data Models

### User Model
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "password_hash": "hashed_password",
  "role": "employee",
  "department": "Engineering",
  "manager_id": 2,
  "appraiser_id": 2,
  "title": "Software Engineer",
  "phone": "+1-555-0123",
  "profile_picture": "https://example.com/avatar.jpg",
  "total_experience_years": 5,
  "company_experience_years": 2,
  "is_active": true,
  "approval_status": "approved",
  "approved_by": 1,
  "approved_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Goal Model
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Improve Code Quality",
  "description": "Reduce bug count by 50%",
  "target": "50% reduction",
  "quarter": "Q1 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "status": "draft",
  "comments": "Focus on unit testing",
  "reviewer_id": 2,
  "progress": 25.50,
  "progress_updated_at": "2024-01-15T10:30:00Z"
}
```

### Review Model
```json
{
  "id": 1,
  "employee_id": 1,
  "reviewer_id": 2,
  "goal_id": 1,
  "review_type": "performance_review",
  "rating": 4,
  "comments": "Good performance",
  "strengths": "Strong technical skills",
  "areas_for_improvement": "Communication skills",
  "action_plan": "Attend communication workshop",
  "status": "submitted",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Notification Model
```json
{
  "id": 1,
  "user_id": 1,
  "type": "goal_review",
  "title": "Goal Review Required",
  "message": "You have a goal pending review",
  "is_read": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "status_code": 400
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Error Examples

#### 401 Unauthorized
```json
{
  "error": "Invalid credentials",
  "status_code": 401
}
```

#### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "status_code": 403
}
```

#### 404 Not Found
```json
{
  "error": "User not found",
  "status_code": 404
}
```

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "status_code": 400
}
```

---

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider implementing:

- **Rate Limiting**: 100 requests per minute per user
- **Burst Limiting**: 10 requests per second per user
- **IP-based Limiting**: 1000 requests per hour per IP

---

## Testing

### Test Credentials
```json
{
  "admin": {
    "email": "admin@test.com",
    "password": "Password123!"
  },
  "manager": {
    "email": "manager@test.com",
    "password": "Password123!"
  },
  "employee": {
    "email": "employee@test.com",
    "password": "Password123!"
  }
}
```

### Example API Calls

#### Login
```bash
curl -X POST https://emps-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Password123!"}'
```

#### Get Users (with token)
```bash
curl -X GET https://emps-backend.onrender.com/api/users/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

#### Create Goal
```bash
curl -X POST https://emps-backend.onrender.com/api/goals/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Improve Code Quality",
    "description": "Reduce bug count by 50%",
    "target": "50% reduction",
    "quarter": "Q1 2024"
  }'
```

---

This API documentation provides comprehensive coverage of all endpoints, data models, and usage patterns for the Employee Performance Management System. 