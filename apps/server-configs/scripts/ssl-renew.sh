#!/usr/bin/env bash
# scripts/ssl-renew.sh
# Obtain or renew Let's Encrypt SSL certificates
# Layer 4 - The Full Stack Observatory

set -euo pipefail

DOMAIN="${1:-example.com}"
EMAIL="${2:-admin@$DOMAIN}"

echo "SSL Certificate Setup for $DOMAIN"
echo "======================================"

# Install certbot if needed
if ! command -v certbot >/dev/null 2>&1; then
    echo "Installing certbot..."
    apt-get update -qq
    apt-get install -y -qq certbot python3-certbot-nginx
fi

# Obtain certificate
echo "Requesting certificate for $DOMAIN..."
certbot --nginx \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --redirect

# Verify auto-renewal
echo "Testing auto-renewal..."
certbot renew --dry-run

# Reload nginx
echo "Reloading nginx with new certificates..."
nginx -t && systemctl reload nginx

echo ""
echo "SSL setup complete."
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  Auto-renew:  certbot runs twice daily via systemd timer"
echo "  Test:        https://$DOMAIN"
