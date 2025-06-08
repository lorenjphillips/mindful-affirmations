# Meditation App Deployment Guide

This guide will walk you through deploying the Meditation App to a production environment using Docker, Nginx, and SSL with Let's Encrypt.

## Prerequisites

- A VPS server (Recommended: Hostinger VPS as mentioned)
- Domain name pointing to your server
- Docker and Docker Compose installed on your server
- Basic knowledge of Linux, Docker, and networking

## Step 1: Server Setup

1. Create a VPS instance on Hostinger or your preferred provider
2. Connect to your server via SSH:
   ```bash
   ssh root@your-server-ip
   ```
3. Install Docker and Docker Compose:
   ```bash
   # Update package index
   apt update
   
   # Install required packages
   apt install -y apt-transport-https ca-certificates curl software-properties-common
   
   # Add Docker's GPG key
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
   
   # Add Docker repository
   add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   
   # Update package index again
   apt update
   
   # Install Docker
   apt install -y docker-ce
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   
   # Verify installation
   docker --version
   docker-compose --version
   ```

## Step 2: Application Deployment

1. Clone your repository to the server or upload your files
2. Navigate to your application directory
3. Edit configuration files to match your domain:
   ```bash
   # Edit Nginx configuration
   nano nginx/conf/app.conf
   ```
   - Replace `your-domain.com` with your actual domain name
   
   ```bash
   # Edit the SSL initialization script
   nano init-letsencrypt.sh
   ```
   - Update `domains=(your-domain.com www.your-domain.com)` with your domain
   - Update `email="your-email@example.com"` with your email address

4. Edit docker-compose.yml if needed:
   ```bash
   nano docker-compose.yml
   ```
   - Update database credentials (if needed)
   - Change ports if required

5. Initialize SSL certificates:
   ```bash
   # Make the script executable if not already
   chmod +x init-letsencrypt.sh
   
   # Run the script
   ./init-letsencrypt.sh
   ```

6. Start the application:
   ```bash
   docker-compose up -d
   ```

## Step 3: Database Initialization

After the containers are running, you need to initialize your database schema:

```bash
# Connect to the application container
docker-compose exec app sh

# Run database migrations (if applicable)
npm run db:push

# Exit the container
exit
```

## Step 4: Verify Deployment

1. Visit your domain in a web browser (`https://your-domain.com`)
2. Check if everything is working as expected

## Step 5: Maintenance

### Viewing Logs

```bash
# View all container logs
docker-compose logs

# View logs for a specific service
docker-compose logs app
docker-compose logs db
docker-compose logs nginx
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart a specific service
docker-compose restart app
```

### Updating the Application

```bash
# Pull the latest changes
git pull

# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d
```

### SSL Certificate Renewal

SSL certificates will automatically renew via the certbot container.

## Continuous Integration / Continuous Deployment (CI/CD)

For automated deployments, you can set up a simple CI/CD pipeline using GitHub Actions or a similar service:

1. Create a `.github/workflows/deploy.yml` file in your repository:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/your/app
            git pull
            docker-compose down
            docker-compose build
            docker-compose up -d
```

2. Add the required secrets to your GitHub repository:
   - `SSH_HOST`: Your server's IP address
   - `SSH_USERNAME`: SSH username (usually root)
   - `SSH_PRIVATE_KEY`: Your private SSH key

## Troubleshooting

### Database Connection Issues

If your application can't connect to the database:

1. Check if the database container is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Make sure the DATABASE_URL environment variable is set correctly in docker-compose.yml

### SSL Certificate Issues

If you encounter issues with the SSL certificates:

1. Check certbot logs:
   ```bash
   docker-compose logs certbot
   ```

2. Make sure your domain's DNS is properly configured and pointing to your server

3. If needed, run the init-letsencrypt.sh script again with staging mode enabled:
   ```bash
   # Edit the script and set staging=1
   nano init-letsencrypt.sh
   
   # Run it again
   ./init-letsencrypt.sh
   ```

### Server Performance

If your server performance is not optimal:

1. Monitor resource usage:
   ```bash
   docker stats
   ```

2. Consider upgrading your VPS plan for more resources if needed

## Support

For any issues or questions, please refer to the project documentation or contact your development team.