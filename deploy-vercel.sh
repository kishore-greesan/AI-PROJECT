#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Check if .env file exists, if not create one
if [ ! -f .env ]; then
    echo "📝 Creating .env file for frontend..."
    cat > .env << EOF
VITE_API_URL=https://your-railway-backend-url.railway.app/api
EOF
    echo "⚠️  Please update VITE_API_URL in frontend/.env with your actual Railway backend URL"
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "📋 Next steps:"
echo "1. Update VITE_API_URL in frontend/.env with your Railway backend URL"
echo "2. Run 'vercel --prod' again to deploy with the correct API URL" 