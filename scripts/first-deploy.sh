#!/bin/bash
# First-time VPS setup and deployment script
# Run this on your VPS to set up everything

set -e

APP_DIR="/opt/fire-productions"
REPO_URL="https://github.com/ravinduravisara/-Fire-Productions-Pvt-Ltd.git"

echo "=========================================="
echo "  Fire Productions - VPS First Deploy"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
    echo "🐳 Installing Docker Compose plugin..."
    apt install -y docker-compose-plugin
else
    echo "✅ Docker Compose already installed"
fi

# Install git if not present
if ! command -v git &> /dev/null; then
    echo "📥 Installing Git..."
    apt install -y git
fi

# Clone or pull repository
if [ -d "$APP_DIR" ]; then
    echo "📥 Pulling latest code..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production template..."
    cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongodb:27017/test

# Email settings (update these)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_TO=fireproductionspvtltd@gmail.com
MAIL_FROM_NAME=Fire Productions Website
MAIL_FROM_EMAIL=no-reply@fireproductions.lk

# Admin
ADMIN_TOKEN=your-secure-admin-token
EOF
    echo "⚠️  Please edit .env.production with your actual values!"
fi

# Build and start containers
echo "🔨 Building Docker images..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "🚀 Starting containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
sleep 15

# Restore database from backup
echo "📦 Restoring database from backup..."
docker compose exec -T mongodb mongorestore --db test /backup/test || echo "No backup to restore or already restored"

# Show status
echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Your app should be available at:"
echo "   http://fireproductions.lk"
echo "   http://192.227.228.204"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.production with your SMTP settings"
echo "   2. Set up GitHub secrets for auto-deploy"
echo "   3. (Optional) Set up SSL with Certbot"
echo ""
