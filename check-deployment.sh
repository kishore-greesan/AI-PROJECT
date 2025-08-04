#!/bin/bash

echo "🔍 Checking Deployment Status..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name ($url)... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check API endpoint
check_api() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name ($url)... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

echo ""
echo "📋 Deployment Checklist:"
echo "========================"

# Check if environment variables are set
echo ""
echo "🔧 Environment Variables:"

if [ -n "$RAILWAY_URL" ]; then
    echo -e "${GREEN}✅ RAILWAY_URL is set${NC}"
else
    echo -e "${YELLOW}⚠️  RAILWAY_URL not set (set this to your Railway backend URL)${NC}"
fi

if [ -n "$VERCEL_URL" ]; then
    echo -e "${GREEN}✅ VERCEL_URL is set${NC}"
else
    echo -e "${YELLOW}⚠️  VERCEL_URL not set (set this to your Vercel frontend URL)${NC}"
fi

echo ""
echo "🌐 URL Checks:"

# Check Railway backend (if URL is provided)
if [ -n "$RAILWAY_URL" ]; then
    check_url "$RAILWAY_URL" "Railway Backend"
    check_api "$RAILWAY_URL/health" "Railway Health"
    check_api "$RAILWAY_URL/api/auth/login" "Railway API"
else
    echo -e "${YELLOW}⚠️  Skipping Railway checks (RAILWAY_URL not set)${NC}"
fi

# Check Vercel frontend (if URL is provided)
if [ -n "$VERCEL_URL" ]; then
    check_url "$VERCEL_URL" "Vercel Frontend"
    check_api "$VERCEL_URL/api/health" "Vercel API Proxy"
else
    echo -e "${YELLOW}⚠️  Skipping Vercel checks (VERCEL_URL not set)${NC}"
fi

echo ""
echo "📝 Manual Checks:"
echo "1. Visit your frontend URL and try to log in"
echo "2. Check browser console for any errors"
echo "3. Test all major features (dashboard, reports, etc.)"
echo "4. Verify CORS is working (no cross-origin errors)"

echo ""
echo "🔗 Quick Links:"
echo "- Railway Dashboard: https://railway.app/dashboard"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- GitHub Repository: https://github.com/your-username/your-repo"

echo ""
echo "✅ Deployment check completed!" 