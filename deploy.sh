#!/bin/bash
# ─────────────────────────────────────────────────────────
# ATAPOLY CBT — cPanel Deployment Script
# Builds frontend, bundles with backend, packages for upload
# ─────────────────────────────────────────────────────────

set -e

DEPLOY_DIR="deploy-package"
ARCHIVE_NAME="atapoly-cbt-$(date +%Y%m%d_%H%M%S).tar.gz"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ATAPOLY CBT — Deployment Builder        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Step 1: Build frontend
echo "📦 Step 1/5: Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..
echo "   ✅ Frontend built successfully"

# Step 2: Clean deploy directory
echo "🧹 Step 2/5: Preparing deploy package..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Step 3: Copy backend
echo "📋 Step 3/5: Copying backend files..."
cp -r backend/* "$DEPLOY_DIR/"
# Remove dev files
rm -f "$DEPLOY_DIR/docker-compose.yml" "$DEPLOY_DIR/Dockerfile" "$DEPLOY_DIR/.dockerignore" "$DEPLOY_DIR/DockerBuilding.MD"

# Step 4: Copy frontend build into backend/public
echo "🔗 Step 4/5: Integrating frontend build..."
rm -rf "$DEPLOY_DIR/public"
mkdir -p "$DEPLOY_DIR/public"
cp -r frontend/dist/* "$DEPLOY_DIR/public/"
# Ensure uploads directory exists
mkdir -p "$DEPLOY_DIR/public/uploads"

# Create .htaccess for Apache reverse proxy (cPanel)
cat > "$DEPLOY_DIR/.htaccess" << 'HTACCESS'
DirectoryIndex disabled
RewriteEngine On

# Proxy all requests to Node.js app
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
HTACCESS

# Create ecosystem.config.js for PM2 (if available on cPanel)
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'PM2'
module.exports = {
  apps: [{
    name: 'atapoly-cbt',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
PM2

# Create .env.example
cat > "$DEPLOY_DIR/.env.example" << 'ENVFILE'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=atapoly_cbt
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=change_this_to_a_random_string

# Sync (for offline server connecting to online)
# ONLINE_SERVER_URL=https://your-online-domain.com
# SYNC_INTERVAL=18000000
# SYNC_SECRET=shared_secret_between_servers
ENVFILE

# Step 5: Create archive
echo "📦 Step 5/5: Creating deployment archive..."
tar -czf "$ARCHIVE_NAME" -C "$DEPLOY_DIR" .
echo ""
echo "═══════════════════════════════════════════════"
echo "✅ Deployment package ready: $ARCHIVE_NAME"
echo "   Size: $(du -sh "$ARCHIVE_NAME" | cut -f1)"
echo ""
echo "📋 Upload Instructions:"
echo "   1. Upload $ARCHIVE_NAME to cPanel File Manager"
echo "   2. Extract to your app directory (e.g., ~/atapoly-cbt/)"
echo "   3. SSH in and run: cd ~/atapoly-cbt && npm install --production"
echo "   4. Create .env file from .env.example"
echo "   5. Initialize DB: node db/init.js"
echo "   6. Start via cPanel Node.js Selector or: pm2 start ecosystem.config.js"
echo "   7. Configure Apache reverse proxy (.htaccess) or cPanel Node.js app"
echo "═══════════════════════════════════════════════"
echo ""

# Cleanup
rm -rf "$DEPLOY_DIR"
