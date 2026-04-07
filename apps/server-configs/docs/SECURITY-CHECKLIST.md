# Security Checklist - Layer 4: Servers

Production hardening checklist for the server configuration in this repository.
Cross-references Layer 8 (Security) of The Full Stack Observatory.

## nginx Hardening

- [x] **TLS 1.2+ only** - `ssl_protocols TLSv1.2 TLSv1.3` (SSLv3, TLS 1.0, and TLS 1.1 disabled)
- [x] **Strong ciphers** - ECDHE + AES-GCM only, server preference enforced
- [x] **HSTS** - `max-age=63072000; includeSubDomains; preload` (2-year commitment)
- [x] **X-Frame-Options: DENY** - prevents clickjacking
- [x] **X-Content-Type-Options: nosniff** - prevents MIME sniffing
- [x] **Referrer-Policy** - `strict-origin-when-cross-origin`
- [x] **Permissions-Policy** - camera, microphone, geolocation disabled
- [x] **CSP** - `default-src 'self'; script-src 'self'`
- [x] **Rate limiting** - 30 req/s per IP with burst=50
- [x] **Dotfile blocking** - `location ~ /\.` returns 403
- [x] **HTTP -> HTTPS redirect** - port 80 returns 301
- [x] **Server version hidden** - `server_tokens off`
- [x] **OCSP stapling** - reduces TLS handshake latency

## Process Security

- [x] **Non-root user** - PM2 runs as `deploy`, not root
- [x] **WorkingDirectory set** - prevents path traversal in relative requires
- [x] **PM2_HOME isolated** - per-app PM2 state, no cross-contamination
- [x] **File descriptor limit** - `LimitNOFILE=65535` (matches nginx workers)
- [x] **Restart dampening** - `RestartSec=5` + `exp_backoff_restart_delay`
- [x] **Memory ceiling** - `max_memory_restart: 512M` catches leaks

## Network Security

- [x] **Firewall** - only ports 80, 443, and 22 open (via `ufw`)
- [x] **Upstream on localhost** - Node.js binds to `127.0.0.1:3000` only
- [x] **Keepalive pooling** - 32 persistent connections to upstream
- [ ] **Fail2ban** - consider installing for SSH brute-force protection
- [ ] **SSH key-only** - disable password authentication in `/etc/ssh/sshd_config`

## Certificate Management

- [x] **Let's Encrypt** - free, automated certificates
- [x] **Auto-renewal** - certbot systemd timer runs twice daily
- [x] **Renewal tested** - `certbot renew --dry-run` passes
- [ ] **Certificate transparency monitoring** - consider crt.sh alerts

## Monitoring (see Layer 11)

- [ ] **Access log monitoring** - forward to centralized logging
- [ ] **Error rate alerting** - alert on 5xx spike
- [ ] **Certificate expiry alerting** - alert 14 days before expiry
- [ ] **Uptime monitoring** - external health check on `/api/health`
