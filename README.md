# 🚀 AI-PROJECT Repository

## Overview
This repository contains the **Employee Performance Management System** - a comprehensive web application built with FastAPI backend and React frontend.

## 📁 Project Structure

```
AI-PROJECT/
└── I24143_KISHOREGREESAN_DEV_L2/
    ├── backend/                 # FastAPI Backend
    │   ├── app/                # Application code
    │   ├── requirements.txt    # Python dependencies
    │   └── main.py            # Entry point
    ├── frontend/               # React Frontend
    │   ├── src/               # Source code
    │   ├── package.json       # Node.js dependencies
    │   └── vite.config.js     # Vite configuration
    ├── render.yaml            # Render deployment config
    ├── docker-compose.yml     # Local development
    └── README.md             # Project documentation
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (can be upgraded to PostgreSQL)
- **JWT** - Authentication and authorization
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Client-side routing

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kishore-greesan/AI-PROJECT.git
   cd AI-PROJECT/I24143_KISHOREGREESAN_DEV_L2
   ```

2. **Start with Docker (Recommended):**
   ```bash
   docker-compose up -d
   ```

3. **Or start manually:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   
   # Frontend
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔐 Default Login Credentials

- **Admin:** `admin@test.com` / `Password123!`
- **Manager:** `manager@test.com` / `Password123!`
- **Employee:** `employee@test.com` / `Password123!`

## 🌟 Features

### User Management
- User registration and authentication
- Role-based access control (Admin, Manager, Employee)
- Profile management
- Organizational hierarchy

### Goal Management
- Create and track performance goals
- Progress updates and history
- Goal reviews and approvals
- Performance metrics

### Performance Reviews
- 360-degree performance reviews
- Review cycles and scheduling
- Feedback and comments
- Review history

### Reports & Analytics
- Admin dashboard with key metrics
- Manager team overview
- Performance trends
- Goal progress tracking

### Notifications
- Real-time notifications
- Email alerts
- System announcements

## 🚀 Deployment

### Render Deployment (Recommended)
See [RENDER_DEPLOYMENT.md](I24143_KISHOREGREESAN_DEV_L2/RENDER_DEPLOYMENT.md) for detailed instructions.

### Railway Deployment
See [RAILWAY_DEPLOYMENT.md](I24143_KISHOREGREESAN_DEV_L2/RAILWAY_DEPLOYMENT.md) for detailed instructions.

### Vercel Deployment
See [VERCEL_DEPLOYMENT.md](I24143_KISHOREGREESAN_DEV_L2/VERCEL_DEPLOYMENT.md) for detailed instructions.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/{id}` - Update goal
- `GET /api/goals/review` - Goals for review

### Reports
- `GET /api/reports/admin/overview` - Admin dashboard
- `GET /api/reports/manager/team` - Manager reports

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./app.db

# JWT
JWT_SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=*

# Debug
DEBUG=false
```

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Kishore Greesan**  
GitHub: [@kishore-greesan](https://github.com/kishore-greesan)

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the deployment guides in the `I24143_KISHOREGREESAN_DEV_L2/` folder
- Review the API documentation at `/docs` when running locally

---

**🎯 Project Status:** Ready for deployment  
**📦 Repository:** https://github.com/kishore-greesan/AI-PROJECT.git  
**🌐 Branch:** `main`  
**📁 Root Folder:** `I24143_KISHOREGREESAN_DEV_L2/` 