# 🚀 Render Deployment Guide

## Overview
This guide will help you deploy the Employee Performance Management System to Render.

## Prerequisites
- GitHub account
- Render account (free tier available)
- Your code pushed to GitHub

## Step 1: Prepare GitHub Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 2: Deploy Backend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository:**
   - Select your repository: `AI-PROJECT`
   - Select branch: `main`

4. **Configure Backend Service:**
   - **Name:** `emp-performance-backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables:**
   ```
   DATABASE_URL=sqlite:///./app.db
   JWT_SECRET_KEY=<generate-random-string>
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=false
   ALLOWED_ORIGINS=*
   ```

6. **Click "Create Web Service"**

## Step 3: Deploy Frontend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Static Site"**
3. **Connect your GitHub repository:**
   - Select your repository: `AI-PROJECT`
   - Select branch: `main`

4. **Configure Frontend Service:**
   - **Name:** `emp-performance-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

5. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

6. **Click "Create Static Site"**

## Step 4: Update API URL

1. **Get your backend URL** from Render dashboard
2. **Update frontend environment variable:**
   - Go to frontend service settings
   - Update `VITE_API_URL` to your backend URL

## Step 5: Test Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Frontend Access:**
   - Visit your frontend URL
   - Test login with: `admin@test.com` / `Password123!`

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in requirements.txt

2. **CORS Errors:**
   - Verify `ALLOWED_ORIGINS` is set to `*`
   - Check frontend API URL configuration

3. **Database Issues:**
   - SQLite database will be created automatically
   - For production, consider using PostgreSQL

## URLs After Deployment

- **Backend API:** `https://emp-performance-backend.onrender.com`
- **Frontend:** `https://emp-performance-frontend.onrender.com`

## Default Login Credentials

- **Admin:** `admin@test.com` / `Password123!`
- **Manager:** `manager@test.com` / `Password123!`
- **Employee:** `employee@test.com` / `Password123!`

## Support

If you encounter issues:
1. Check Render build logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors 