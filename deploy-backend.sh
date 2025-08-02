#!/bin/bash

echo "🚀 Deploying Backend to Railway/Render..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Check if everything is ready
if [ $? -eq 0 ]; then
    echo "✅ Backend is ready for deployment!"
    echo ""
    echo "📋 Deployment Options:"
    echo ""
    echo "🌐 Railway (Recommended):"
    echo "1. Install Railway CLI: npm i -g @railway/cli"
    echo "2. Login: railway login"
    echo "3. Initialize: railway init"
    echo "4. Deploy: railway up"
    echo ""
    echo "🌐 Render:"
    echo "1. Connect your GitHub repository to Render"
    echo "2. Create a new Web Service"
    echo "3. Set build command: pip install -r requirements.txt"
    echo "4. Set start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    echo ""
    echo "🔧 Environment Variables to set:"
    echo "- DATABASE_URL: Your production database URL"
    echo "- JWT_SECRET_KEY: A secure secret key"
    echo "- DEBUG: False"
else
    echo "❌ Backend setup failed!"
    exit 1
fi 