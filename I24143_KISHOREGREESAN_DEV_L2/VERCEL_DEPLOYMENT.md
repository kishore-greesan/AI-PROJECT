# ⚡ Vercel Frontend Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Railway Backend**: Your backend should be deployed on Railway first

## Step-by-Step Deployment

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and branch

### 2. Configure Build Settings

Vercel will auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configure Environment Variables

In your Vercel project settings, add:

```bash
# API Configuration
VITE_API_URL=https://your-railway-backend-url.railway.app/api
```

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. You'll get a URL like: `https://your-app-name.vercel.app`

### 5. Configure Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Your Railway backend API URL | Yes | `https://your-app.railway.app/api` |

## Vercel Configuration

The `vercel.json` file in the frontend directory handles:

- **API Proxy**: Routes `/api/*` requests to your Railway backend
- **SPA Routing**: Handles React Router routes
- **CORS Headers**: Adds necessary CORS headers for API requests

## Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **API Proxy**: Test `/api/health` endpoint
3. **Login**: Try logging in with test credentials

## Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs for missing dependencies
2. **API Connection**: Ensure `VITE_API_URL` is correct
3. **CORS Errors**: Verify API proxy configuration in `vercel.json`

### Debugging

- Check Vercel function logs
- Use browser developer tools
- Test API endpoints directly

## Performance Optimization

1. **Image Optimization**: Vercel automatically optimizes images
2. **Caching**: Configure caching headers in `vercel.json`
3. **CDN**: Vercel provides global CDN

## Next Steps

After successful deployment:

1. Test all features
2. Configure custom domain (optional)
3. Set up monitoring
4. Configure analytics

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)
- [Vercel Status](https://vercel-status.com/)

## Quick Deploy

You can also deploy directly from the command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel --prod
``` 