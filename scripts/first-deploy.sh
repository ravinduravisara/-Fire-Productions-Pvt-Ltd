#!/bin/bash
# First-time VPS setup and deployment script for Fire Productions
# Now uses PostgreSQL instead of MongoDB

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

# Create backup directory
mkdir -p postgres-backup

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production template..."
    cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000

# PostgreSQL connection (used by Prisma)
POSTGRES_URL=postgresql://fire:firepassword@postgres:5432/firedb?schema=public

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

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to start..."
sleep 10

# Check if PostgreSQL is ready
until docker compose exec -T postgres pg_isready -U fire -d firedb 2>/dev/null; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "� Running database migrations..."
docker compose exec -T server npx prisma migrate deploy || echo "Migrations skipped or already applied"

# Check if we need to seed initial data
echo "📦 Checking if database needs seeding..."
TABLE_COUNT=$(docker compose exec -T postgres psql -U fire -d firedb -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$TABLE_COUNT" -le "1" ]; then
    echo "ℹ️  Database is empty. You may want to seed initial data via admin dashboard."
else
    echo "✅ Database has $TABLE_COUNT tables."
fi

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
echo "   3. Add categories and products via admin dashboard"
echo "   4. (Optional) Set up SSL with Certbot"
echo ""
