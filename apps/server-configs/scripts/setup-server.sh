#!/usr/bin/env bash
# scripts/setup-server.sh
# One-shot server provisioning for a fresh Ubuntu 22.04+ / Debian 12+ machine
# Layer 4 - The Full Stack Observatory

set -euo pipefail

echo "Full Stack Observatory - Server Setup (Layer 4)"
echo "==================================================="

# Check root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root (use sudo)."
    exit 1
fi

DEPLOY_USER="deploy"
APP_DIR="/var/www/api-server"

# System updates
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install nginx
echo "Installing nginx..."
apt-get install -y -qq nginx
systemctl enable nginx

# Install Node.js 22 LTS
echo "Installing Node.js 22 LTS..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
fi
echo "  Node.js $(node --version)"

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2
pm2 install pm2-logrotate

# Create deploy user
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
    echo "Creating deploy user..."
    useradd -m -s /bin/bash "$DEPLOY_USER"
fi

# Create application directory
echo "Setting up application directory..."
mkdir -p "$APP_DIR/logs"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# Copy nginx configs
echo "Installing nginx configuration..."
cp nginx/nginx.conf /etc/nginx/nginx.conf
mkdir -p /etc/nginx/ssl /etc/nginx/sites-available /etc/nginx/sites-enabled
cp nginx/ssl/ssl-params.conf /etc/nginx/ssl/ssl-params.conf
cp nginx/sites-available/api-server.conf /etc/nginx/sites-available/api-server.conf

# Symlink to sites-enabled (remove default if present)
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/api-server.conf /etc/nginx/sites-enabled/api-server.conf

# Test nginx config (will fail if SSL certs do not exist yet - that is expected)
echo "Testing nginx config..."
nginx -t 2>/dev/null && echo "  nginx config OK" || echo "  nginx config has issues (SSL certs may not exist yet - run ssl-renew.sh)"

# Copy PM2 config
echo "Installing PM2 ecosystem config..."
cp pm2/ecosystem.config.js "$APP_DIR/ecosystem.config.js"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/ecosystem.config.js"

# Copy systemd unit
echo "Installing systemd service..."
cp systemd/api-server.service /etc/systemd/system/api-server.service
systemctl daemon-reload
systemctl enable api-server

# Firewall (if ufw is available)
if command -v ufw >/dev/null 2>&1; then
    echo "Configuring firewall..."
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    echo "  Allowed Nginx Full + OpenSSH"
fi

# Summary
echo ""
echo "Server setup complete."
echo "========================="
echo "  nginx:   $(nginx -v 2>&1)"
echo "  node:    $(node --version)"
echo "  pm2:     $(pm2 --version)"
echo "  user:    $DEPLOY_USER"
echo "  app dir: $APP_DIR"
echo ""
echo "Next steps:"
echo "  1. Deploy your app to $APP_DIR (see scripts/deploy.sh)"
echo "  2. Get SSL certificates: sudo ./scripts/ssl-renew.sh"
echo "  3. Start the service: sudo systemctl start api-server"
