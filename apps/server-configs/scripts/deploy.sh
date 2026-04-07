#!/usr/bin/env bash
# scripts/deploy.sh
# Zero-downtime deployment - pull latest code, install deps, reload PM2
# Layer 4 - The Full Stack Observatory

set -euo pipefail

APP_DIR="/var/www/api-server"
DEPLOY_USER="deploy"

echo "Deploying to $APP_DIR..."

# Pull latest code
echo "Pulling latest from main..."
cd "$APP_DIR"
sudo -u "$DEPLOY_USER" git pull origin main

# Install dependencies
echo "Installing dependencies..."
sudo -u "$DEPLOY_USER" npm ci --omit=dev

# Zero-downtime reload
echo "Reloading PM2 (zero-downtime)..."
sudo -u "$DEPLOY_USER" PM2_HOME="$APP_DIR/.pm2" pm2 reload ecosystem.config.js --env production

# Or via systemd (equivalent):
# systemctl reload api-server

# Reload nginx (picks up any config changes)
echo "Reloading nginx..."
nginx -t && systemctl reload nginx

# Verify
echo "Checking health..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo "Deploy successful - /api/health returned $HTTP_CODE"
else
    echo "Health check failed - got HTTP $HTTP_CODE"
    echo "Check logs: sudo -u $DEPLOY_USER PM2_HOME=$APP_DIR/.pm2 pm2 logs --lines 20"
    exit 1
fi
