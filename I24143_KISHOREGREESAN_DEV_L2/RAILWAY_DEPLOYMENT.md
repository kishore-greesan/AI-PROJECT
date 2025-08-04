# 🚂 Railway Backend Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need a PostgreSQL database (Railway provides this)

## Step-by-Step Deployment

### 1. Connect Your Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the branch (usually `main` or `master`)

### 2. Configure Environment Variables

In your Railway project dashboard, add these environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 3. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database settings
5. Update your environment variables with this URL

### 4. Configure Build Settings

Railway will automatically detect the Dockerfile, but you can configure:

- **Root Directory**: `backend/`
- **Dockerfile Path**: `backend/Dockerfile.railway`

### 5. Deploy

1. Railway will automatically build and deploy your application
2. Monitor the build logs for any issues
3. Once deployed, Railway will provide a URL like: `https://your-app-name.railway.app`

### 6. Test Your Deployment

```bash
# Test health endpoint
curl https://your-app-name.railway.app/health

# Test API endpoint
curl https://your-app-name.railway.app/api/auth/login
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes | - |
| `DEBUG` | Enable debug mode | No | False |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token expiry | No | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token expiry | No | 7 |

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the build logs for missing dependencies
2. **Database Connection**: Ensure `DATABASE_URL` is correctly set
3. **Port Issues**: Railway automatically sets the `$PORT` environment variable

### Logs

- View logs in the Railway dashboard
- Use `railway logs` CLI command
- Check application logs for errors

## Next Steps

After successful deployment:

1. Copy your Railway app URL
2. Update the frontend environment variables
3. Deploy the frontend to Vercel
4. Test the complete application

## Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/) 