# Employee Performance Management System

A comprehensive web application for managing employee performance, goals, and reviews with role-based access control.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd L2-emp_Performance_mgmt

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Production Deployment
See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed deployment instructions on Render.

## 📁 Project Structure

```
L2-emp_Performance_mgmt/
├── backend/                 # Flask API backend
│   ├── app/                # Main application code
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── utils/         # Utilities and helpers
│   │   └── main.py        # Flask application entry point
│   ├── alembic/           # Database migrations
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile          # Render deployment config
│   ├── runtime.txt        # Python version
│   └── render_seed.py     # Production database seeding
├── frontend/              # React frontend application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── store/        # State management
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── render.yaml           # Render deployment configuration
├── docker-compose.yml    # Local development setup
├── README.md            # This file
└── RENDER_DEPLOYMENT.md # Deployment guide
```

## 🎯 Features

### User Management
- **Role-based access control** (Admin, Manager, Employee)
- **User registration and approval workflow**
- **Profile management with organizational hierarchy**

### Goal Management
- **Create and track performance goals**
- **Progress tracking and updates**
- **Goal submission for review**
- **Status management (Draft, Submitted, Approved, Rejected)**

### Review System
- **Manager reviews and feedback**
- **Rating system (1-5 stars)**
- **Review history and tracking**

### Reports & Analytics
- **Admin dashboard with comprehensive metrics**
- **Manager team overview and performance tracking**
- **Visual charts and data visualization**
- **Department and role-based statistics**

### Notifications
- **Real-time notification system**
- **Goal completion alerts**
- **Review assignment notifications**

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (local development)
- **PostgreSQL** - Database (production on Render)
- **Alembic** - Database migrations

### Frontend
- **React 18** - JavaScript framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **Recharts** - Data visualization library
- **React Router** - Client-side routing

### Deployment
- **Render** - Cloud platform for hosting
- **Docker** - Containerization (local development)

## 🔐 Authentication & Security

- **JWT-based authentication**
- **Role-based authorization**
- **Password hashing and security**
- **CORS configuration for cross-origin requests**

## 📊 Database Schema

### Core Tables
- **Users** - User accounts and profiles
- **Goals** - Performance goals and progress
- **Reviews** - Manager reviews and feedback
- **Notifications** - System notifications

### Key Relationships
- Users have roles (Admin, Manager, Employee)
- Employees have managers and appraisers
- Goals belong to users and can have reviewers
- Reviews link goals with reviewers

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service for the backend
3. Create a new Static Site for the frontend
4. Configure environment variables
5. Deploy and test

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/` - List all users
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Goal Management
- `GET /api/goals/` - List user goals
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/<id>` - Update goal
- `POST /api/goals/submit_all` - Submit goals for review

### Reports
- `GET /api/reports/admin/overview` - Admin dashboard data
- `GET /api/reports/manager/team-overview` - Manager team data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for deployment issues
- Review the API documentation above
- Check the console logs for debugging information 