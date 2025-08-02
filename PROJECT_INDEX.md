# Employee Performance Management System - Project Index

## Project Overview
This is a full-stack Employee Performance Management System (EPMS) with React frontend and FastAPI backend, featuring goal management, performance reviews, notifications, and user authentication.

## Directory Structure

### Root Level Files
- `README.md` - Main project documentation
- `DEVELOPMENT_LOG.md` - Development progress and notes
- `SYSTEM_DESIGN.md` - System architecture and design decisions
- `USER_STORIES.md` - User requirements and stories
- `BusinessContext.md` - Business context and requirements
- `PROMPT_LOG.md` - AI prompt interactions log
- `docker-compose.yml` - Docker container orchestration
- `package.json` - Root package configuration
- `package-lock.json` - NPM lock file
- `alembic.ini` - Database migration configuration

### Database Files
- `epms.db` - Main SQLite database
- `test.db` - Test database
- `test_goals.db` - Goals test database
- `test_auth_endpoints.db` - Authentication test database

### Frontend (`/frontend/`)
React-based user interface with Vite build system

#### Configuration Files
- `package.json` - Frontend dependencies
- `package-lock.json` - NPM lock file
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `index.html` - Main HTML entry point
- `Dockerfile` - Frontend container configuration

#### Source Code (`/frontend/src/`)
- `main.jsx` - React application entry point
- `App.jsx` - Main application component
- `index.css` - Global styles
- `TestComponent.jsx` - Testing component

#### Components (`/frontend/src/components/`)
- `Layout.jsx` - Main layout wrapper
- `Sidebar.jsx` - Navigation sidebar
- `ProtectedRoute.jsx` - Route protection component
- `GoalCard.jsx` - Goal display component
- `ReviewForm.jsx` - Performance review form
- `ReviewComparison.jsx` - Review comparison component
- `ProgressHistory.jsx` - Progress tracking component
- `ProgressUpdate.jsx` - Progress update form
- `EditableReportingStructure.jsx` - Reporting structure editor
- `NotificationBell.jsx` - Notification component

#### Pages (`/frontend/src/pages/`)
- `Login.jsx` - User authentication page
- `Register.jsx` - User registration page
- `Dashboard.jsx` - Main dashboard
- `Goals.jsx` - Goal management page
- `GoalReview.jsx` - Goal review interface
- `Reviews.jsx` - Performance reviews page
- `Profile.jsx` - User profile page
- `Reports.jsx` - Reporting page (placeholder)
- `Skills.jsx` - Skills page (placeholder)
- `Users.jsx` - User management page (placeholder)

#### Services (`/frontend/src/services/`)
- `api.js` - Base API configuration
- `auth.js` - Authentication service
- `goals.js` - Goal management service
- `reviews.js` - Review management service
- `users.js` - User management service
- `registration.js` - User registration service

#### State Management (`/frontend/src/store/`)
- `authStore.js` - Authentication state management

### Backend (`/backend/`)
FastAPI-based REST API with SQLAlchemy ORM

#### Main Application (`/backend/app/`)
- `main.py` - FastAPI application entry point
- `database.py` - Database connection configuration
- `__init__.py` - Package initialization

#### API Routes (`/backend/app/api/`)
- `__init__.py` - API package initialization
- `auth.py` - Authentication endpoints
- `goal.py` - Goal management endpoints
- `review.py` - Performance review endpoints
- `users.py` - User management endpoints
- `notifications.py` - Notification endpoints
- `upload.py` - File upload endpoints

#### Data Models (`/backend/app/models/`)
- `__init__.py` - Models package initialization
- `user.py` - User data model
- `goal.py` - Goal data model
- `review.py` - Review data model
- `notification.py` - Notification data model

#### Pydantic Schemas (`/backend/app/schemas/`)
- `__init__.py` - Schemas package initialization
- `user.py` - User request/response schemas
- `goal.py` - Goal request/response schemas
- `review.py` - Review request/response schemas
- `notification.py` - Notification schemas

#### Business Logic (`/backend/app/services/`)
- `__init__.py` - Services package initialization
- `auth_service.py` - Authentication business logic
- `notification_service.py` - Notification business logic

#### Configuration (`/backend/app/config/`)
- `__init__.py` - Config package initialization
- `settings.py` - Application settings

#### Utilities (`/backend/app/utils/`)
- `__init__.py` - Utils package initialization
- `security.py` - Security utilities (JWT, password hashing)

#### Testing (`/backend/tests/`)
- `test_auth.py` - Authentication tests
- `test_goals.py` - Goal management tests

#### Database Scripts (`/backend/`)
- `create_db.py` - Database creation script
- `seed_data.py` - Sample data seeding
- `recreate_database.py` - Database recreation script
- `reset_database.py` - Database reset script
- `create_sample_data.py` - Sample data creation
- `create_sample_reviews.py` - Sample review data
- `create_reviews_table.py` - Reviews table creation
- `create_notifications_table.py` - Notifications table creation
- `fix_goals_table.py` - Goals table fixes
- `add_appraiser_column.py` - Database schema updates
- `add_appraiser_column_sqlite.py` - SQLite-specific updates

#### Authentication Scripts (`/backend/`)
- `test_auth.py` - Authentication testing
- `test_auth_fix.py` - Auth fixes testing
- `test_login_endpoint.py` - Login endpoint testing
- `test_auth_simple.py` - Simple auth testing
- `test_api_login.py` - API login testing
- `test_password_verification.py` - Password verification testing
- `test_password.py` - Password testing
- `test_password_fixed.py` - Fixed password testing
- `test_token_verification.py` - Token verification testing
- `test_frontend_auth.py` - Frontend auth testing
- `debug_auth.py` - Auth debugging
- `debug_auth_service.py` - Auth service debugging
- `debug_login.py` - Login debugging
- `debug_http_login.py` - HTTP login debugging
- `debug_http_db.py` - HTTP database debugging
- `debug_reviews_query.py` - Reviews query debugging
- `fix_auth.py` - Auth fixes
- `create_test_user.py` - Test user creation
- `create_test_admin.py` - Test admin creation
- `update_manager_password.py` - Manager password updates
- `update_admin_password.py` - Admin password updates
- `assign_manager.py` - Manager assignment
- `assign_appraisers.py` - Appraiser assignment

#### Review Scripts (`/backend/`)
- `test_create_review.py` - Review creation testing
- `test_reviews_with_token.py` - Token-based review testing
- `test_reviews_direct.py` - Direct review testing
- `test_reviews_api.py` - Review API testing
- `check_user_reviews.py` - User review checking
- `check_reviews.py` - Review checking

#### Database Checking Scripts (`/backend/`)
- `check_epms_db.py` - EPMS database checking
- `check_http_db.py` - HTTP database checking
- `check_all_tables.py` - All tables checking
- `check_db.py` - Database checking
- `check_users.py` - Users checking

#### Goal Testing Scripts (`/backend/`)
- `test_goal_progress_status.py` - Goal progress testing
- `test_reporting_structure.py` - Reporting structure testing

#### Configuration Files (`/backend/`)
- `requirements.txt` - Python dependencies
- `Dockerfile` - Backend container configuration
- `alembic.ini` - Database migration configuration

### Database Migrations (`/alembic/`)
- `env.py` - Alembic environment configuration
- `script.py.mako` - Migration script template
- `README` - Migration documentation

#### Migration Versions (`/alembic/versions/`)
- `e3618f4ab82d_init.py` - Initial database schema
- `fffcc21cbe39_add_goal_progress_tracking.py` - Goal progress tracking addition

### Database Initialization (`/mssql-init/`)
- `init-epms.sql` - SQL Server initialization script

### Development Environment
- `venv/` - Python virtual environment
- `node_modules/` - Node.js dependencies (frontend and root)
- `.pytest_cache/` - Python test cache
- `uploads/` - File upload directory

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing and verification
- Protected routes

### Goal Management
- Goal creation and tracking
- Progress updates
- Goal review system
- Performance metrics

### Performance Reviews
- Review creation and management
- Review comparison
- Appraiser assignment
- Review status tracking

### Notifications
- Real-time notifications
- Notification bell component
- Notification management

### User Management
- User registration and profiles
- Manager assignment
- Reporting structure
- User roles and permissions

### File Upload
- Document upload functionality
- File management

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (HTTP client)

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Alembic (database migrations)
- SQLite (development database)
- JWT (authentication)

### Development Tools
- Docker (containerization)
- Docker Compose (orchestration)
- Pytest (testing)
- ESLint (code linting)

## Database Schema
The system uses SQLite for development with the following main tables:
- Users (authentication and profiles)
- Goals (performance goals)
- Reviews (performance reviews)
- Notifications (system notifications)

## API Endpoints
- `/auth/*` - Authentication endpoints
- `/goals/*` - Goal management
- `/reviews/*` - Review management
- `/users/*` - User management
- `/notifications/*` - Notification management
- `/upload/*` - File upload

## Development Status
The project appears to be in active development with comprehensive testing, debugging scripts, and ongoing feature development. The system includes both frontend and backend components with proper separation of concerns. 