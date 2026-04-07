# fullstack-server-configs - Layer 4

[![Part of The Full Stack Observatory](https://img.shields.io/badge/Observatory-Layer_4-9be564)](https://markusisaksson1982.github.io/layers/servers/)

Companion code for **Layer 4 (Servers)** of [The Full Stack Observatory](https://markusisaksson1982.github.io/layers/servers/).

Every config file in this repo is the production-oriented version of what visitors click through on the layer page's interactive config explorer. Clone this repo, adapt the domain names, and you have a solid starting point for a production server setup.

## What's Inside

| File | Purpose |
|------|---------|
| `nginx/nginx.conf` | Main nginx config: workers, gzip, rate limiting |
| `nginx/sites-available/api-server.conf` | Virtual host: TLS, security headers, reverse proxy, static files |
| `nginx/ssl/ssl-params.conf` | Extracted TLS settings reusable across vhosts |
| `pm2/ecosystem.config.js` | PM2 cluster mode, logging, memory limits, backoff |
| `systemd/api-server.service` | systemd unit: boot start, restart-on-failure, non-root user |
| `scripts/setup-server.sh` | One-shot server provisioning script |
| `scripts/deploy.sh` | Zero-downtime deployment script |
| `scripts/ssl-renew.sh` | Let's Encrypt certificate renewal |
| `docs/ARCHITECTURE.md` | Request flow and config ownership |
| `docs/SECURITY-CHECKLIST.md` | Server hardening checklist |

## Quick Start

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-server-configs.git
cd fullstack-server-configs

# Review and adapt for your domain:
# 1. Replace "example.com" with your domain in nginx configs
# 2. Update paths in the systemd unit if your app lives elsewhere

# On a fresh Ubuntu/Debian server:
chmod +x scripts/*.sh
sudo ./scripts/setup-server.sh
```

## Request Flow

```text
Client -> CDN -> nginx (TLS + static files + rate limiting) -> PM2 cluster (Node.js xN) -> PostgreSQL
                 ^                                             ^
                 |                                             |
                 nginx/nginx.conf                              pm2/ecosystem.config.js
                 nginx/sites-available/api-server.conf         systemd/api-server.service
```

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) - the application these configs serve
- [Layer 8: Security](https://markusisaksson1982.github.io/layers/security/) - the security headers configured here
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - containerized alternative to this bare-metal setup
