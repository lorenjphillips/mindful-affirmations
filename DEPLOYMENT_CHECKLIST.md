# Production Deployment Checklist

## Prerequisites Checklist ✅

### Domain & Server Setup
- [ ] Domain name purchased and configured
- [ ] VPS/Server provisioned (recommended: 2GB RAM, 2 CPU cores minimum)
- [ ] SSH access to server configured
- [ ] Server pointed to your domain's A record

### API Keys & Accounts
- [ ] ElevenLabs API account created
- [ ] ElevenLabs API key obtained
- [ ] PostgreSQL database provisioned (or plan to use Docker)
- [ ] SSL email address for Let's Encrypt

### Local Preparation
- [ ] Code tested locally with `npm run test:local`
- [ ] All features working with real API keys
- [ ] Docker and Docker Compose installed on server

---

## Step 1: Server Initial Setup

```bash
# Connect to your server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git ufw

# Configure firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## Step 2: Application Deployment

```bash
# Create application directory
mkdir -p /opt/meditation-app
cd /opt/meditation-app

# Clone your repository
git clone https://github.com/your-username/mindful-affirmations.git .

# Create production environment file
nano .env.production
```

### Environment Configuration (.env.production)
```env
# Database Configuration
DATABASE_URL=postgresql://meditation_user:secure_password_here@db:5432/meditation_app

# ElevenLabs API
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key

# Session Security (generate a secure random string)
SESSION_SECRET=your_super_secure_random_64_character_string

# Environment
NODE_ENV=production

# Server Configuration
PORT=3000
```

## Step 3: SSL Certificate Setup

```bash
# Update domain in Nginx config
nano nginx/conf/app.conf
# Replace 'your-domain.com' with your actual domain

# Update SSL initialization script
nano init-letsencrypt.sh
# Update domains and email address

# Make SSL script executable
chmod +x init-letsencrypt.sh

# Run SSL initialization
./init-letsencrypt.sh
```

## Step 4: Database Setup

```bash
# Start database first
docker-compose up -d db

# Wait for database to be ready (30 seconds)
sleep 30

# Initialize database schema
docker-compose exec app npm run db:push
```

## Step 5: Application Launch

```bash
# Build and start all services
docker-compose build
docker-compose up -d

# Verify all containers are running
docker-compose ps

# Check logs for any errors
docker-compose logs
```

## Step 6: Domain Configuration

### DNS Settings (at your domain registrar)
```
Type: A
Name: @
Value: your-server-ip
TTL: 300

Type: A  
Name: www
Value: your-server-ip
TTL: 300
```

### Verification Steps
```bash
# Test domain resolution
nslookup your-domain.com

# Test SSL certificate
curl -I https://your-domain.com

# Test application response
curl https://your-domain.com/api/health
```

## Step 7: Post-Deployment Testing

### Automated Testing Script
```bash
# Create production test script
cat > test-production.sh << 'EOF'
#!/bin/bash

DOMAIN="https://your-domain.com"
echo "🚀 Testing production deployment..."

# Test 1: SSL Certificate
echo "1. Testing SSL certificate..."
if curl -s -I $DOMAIN | grep -q "200 OK"; then
    echo "   ✅ SSL and server working"
else
    echo "   ❌ SSL or server issue"
fi

# Test 2: API Endpoints
echo "2. Testing API endpoints..."
if curl -s $DOMAIN/api/meditations | grep -q "meditation\|error\|auth"; then
    echo "   ✅ API responding"
else
    echo "   ❌ API not responding"
fi

# Test 3: Static Assets
echo "3. Testing static assets..."
if curl -s -I $DOMAIN/assets/ | grep -q "200\|404"; then
    echo "   ✅ Static assets configured"
else
    echo "   ❌ Static assets issue"
fi

echo "🎯 Production test complete!"
EOF

chmod +x test-production.sh
./test-production.sh
```

## Step 8: Monitoring & Maintenance

### Setup Log Monitoring
```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx

# Check disk usage
df -h

# Check memory usage
free -h
```

### Backup Strategy
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U meditation_user meditation_app > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/meditation-app --exclude=node_modules --exclude=.git

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Setup daily backups (optional)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/meditation-app/backup.sh") | crontab -
```

## Step 9: Update Deployment Process

### Automated Update Script
```bash
cat > update-app.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating meditation app..."

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Wait for startup
sleep 30

# Test deployment
./test-production.sh

echo "✅ Update complete!"
EOF

chmod +x update-app.sh
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. SSL Certificate Issues
```bash
# Check certificate status
docker-compose logs certbot

# Force renewal
docker-compose run --rm certbot renew --force-renewal
docker-compose restart nginx
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Reset database container
docker-compose stop db
docker volume rm mindful-affirmations_postgres_data
docker-compose up -d db
# Wait 30 seconds, then run db:push again
```

#### 3. Audio Generation Issues
```bash
# Check ElevenLabs API key
docker-compose exec app printenv | grep ELEVENLABS

# Check audio directory permissions
docker-compose exec app ls -la /mnt/data/audio/

# Test TTS manually
docker-compose exec app node server/test-elevenlabs.js
```

#### 4. Memory Issues
```bash
# Monitor memory usage
docker stats

# Restart application to free memory
docker-compose restart app
```

---

## Success Criteria ✅

Your deployment is successful when:

- [ ] Domain loads over HTTPS without certificate warnings
- [ ] Home page displays meditation interface
- [ ] User can create and customize meditation sessions
- [ ] Audio generation works (test with ElevenLabs)
- [ ] Background music plays correctly
- [ ] Database stores meditation sessions
- [ ] SSL certificate auto-renews
- [ ] All Docker containers are running stable
- [ ] Logs show no critical errors
- [ ] Application responds within 3 seconds

---

## Performance Optimization (Post-Launch)

### Optional Enhancements
```bash
# Enable Gzip compression in Nginx
# Add to nginx/conf/app.conf:
# gzip on;
# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Setup Redis caching (optional)
# Add Redis container to docker-compose.yml

# Setup monitoring with Prometheus/Grafana (advanced)
```

---

## Maintenance Schedule

### Daily
- [ ] Check application logs for errors
- [ ] Verify SSL certificate status
- [ ] Monitor disk space usage

### Weekly  
- [ ] Run automated backups
- [ ] Update dependencies if needed
- [ ] Check for security updates

### Monthly
- [ ] Review performance metrics
- [ ] Update system packages
- [ ] Rotate old log files 