# Employee Performance Management System - Deployment Guide

## 🚀 Quick Start (Production)

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80 and 8000 available

### 1. Automated Deployment
```bash
# Run the deployment script
./deploy.sh
```

### 2. Manual Deployment
```bash
# Create environment file
cp .env.example .env
# Edit .env with your production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📋 Deployment Options

### Option 1: Local Production Deployment
```bash
# Use the production Docker Compose file
docker-compose -f docker-compose.prod.yml up -d
```

**Access URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Cloud Deployment (AWS/GCP/Azure)

#### AWS EC2 Deployment
```bash
# Install Docker on EC2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <your-repo>
cd L2-emp_Performance_mgmt
./deploy.sh
```

#### Docker Hub Deployment
```bash
# Build and push images
docker build -t your-username/epms-backend:latest ./backend
docker build -t your-username/epms-frontend:latest ./frontend
docker push your-username/epms-backend:latest
docker push your-username/epms-frontend:latest
```

### Option 3: Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
DB_PASSWORD=YourStrongPassword123!

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# API Configuration
API_URL=http://your-domain.com/api

# Application Settings
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Production Security Checklist
- [ ] Change default database password
- [ ] Set strong JWT secret key
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 📊 Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost
```

### Database Backup
```bash
# Backup SQL Server data
docker exec -it l2-emp_performance_mgmt-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD -Q "BACKUP DATABASE epms TO DISK = '/var/opt/mssql/backup/epms.bak'"
```

## 🔐 Security Considerations

### 1. Database Security
- Use strong passwords
- Restrict network access
- Enable encryption at rest
- Regular security updates

### 2. Application Security
- HTTPS everywhere
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### 3. Infrastructure Security
- Firewall configuration
- Network segmentation
- Access control
- Monitoring and alerting

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :8000

# Stop conflicting services
sudo systemctl stop nginx
sudo systemctl stop apache2
```

#### 2. Database Connection Issues
```bash
# Check database container
docker-compose -f docker-compose.prod.yml logs db

# Test connection
docker exec -it l2-emp_performance_mgmt-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD
```

#### 3. Frontend Not Loading
```bash
# Check nginx logs
docker-compose -f docker-compose.prod.yml logs frontend

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend
```

### Performance Optimization

#### 1. Database Optimization
- Index optimization
- Query optimization
- Connection pooling
- Regular maintenance

#### 2. Application Optimization
- Caching strategies
- CDN for static assets
- Load balancing
- Auto-scaling

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Load Balancer Configuration
```bash
# Nginx load balancer example
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python -m alembic upgrade head
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check network connectivity
4. Review security group/firewall rules

## 🎯 Success Metrics

- Application uptime > 99.9%
- API response time < 200ms
- Database connection success rate > 99%
- Zero security vulnerabilities
- Regular backup success 