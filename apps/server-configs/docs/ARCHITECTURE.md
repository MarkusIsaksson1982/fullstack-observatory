# Architecture - Layer 4: Servers

## Request Flow

```text
                 +-----------------------------+
                 |          Internet           |
                 +-------------+---------------+
                               |
                               v
                 +-----------------------------+
                 | CDN (Fastly / Cloudflare)   |
                 | Caches static assets at edge|
                 +-------------+---------------+
                               |
                               v HTTPS (443)
+------------------------------------------------------------------+
|                              nginx                               |
|                                                                  |
| - TLS termination (Let's Encrypt)                                |
| - Security headers (HSTS, CSP, X-Frame, etc.)                    |
| - Gzip compression                                                |
| - Rate limiting                                                   |
| - Static file serving (/static/ -> disk)                          |
| - Reverse proxy (/api/ -> upstream)                               |
+----------------------------+-------------------------------------+
                             |
                             v HTTP (3000, localhost)
+------------------------------------------------------------------+
|                           PM2 Cluster                            |
|                                                                  |
| - Cluster mode (1 worker per CPU core)                           |
| - Zero-downtime reload                                           |
| - Memory limit restart (512MB)                                   |
| - Exponential backoff on crash                                   |
| - Structured merged logging                                      |
|                                                                  |
|   Node #0      Node #1      Node #2 ...                          |
+----------------------------+-------------------------------------+
                             |
                             v TCP (5432)
+------------------------------------------------------------------+
|                           PostgreSQL                             |
|              Application data managed by Layer 3                 |
+------------------------------------------------------------------+

systemd manages the PM2 process: start on boot, restart on failure.
```

## Config File Locations (Production)

| Config | Path | Managed By |
|--------|------|------------|
| nginx main | `/etc/nginx/nginx.conf` | This repo |
| nginx vhost | `/etc/nginx/sites-available/api-server.conf` | This repo |
| TLS params | `/etc/nginx/ssl/ssl-params.conf` | This repo |
| TLS certs | `/etc/letsencrypt/live/example.com/` | certbot |
| PM2 ecosystem | `/var/www/api-server/ecosystem.config.js` | This repo |
| systemd unit | `/etc/systemd/system/api-server.service` | This repo |
| App source | `/var/www/api-server/src/` | Layer 2 repo |
| DB schema | Managed by migrations | Layer 3 repo |

## Layer Cross-References

- **Layer 2** ([Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/)): The Express.js application that runs inside PM2
- **Layer 3** ([Database](https://markusisaksson1982.github.io/layers/database/)): PostgreSQL schema that the app queries
- **Layer 7** ([CI/CD](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/)): Pipeline that triggers `deploy.sh`
- **Layer 8** ([Security](https://markusisaksson1982.github.io/layers/security/)): Headers configured in the nginx vhost
- **Layer 9** ([Containers](https://markusisaksson1982.github.io/layers/containers/)): Docker-based alternative to this bare-metal setup
