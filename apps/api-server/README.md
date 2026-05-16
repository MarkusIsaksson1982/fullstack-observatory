# ![Part of The Full Stack Observatory — Layer 2](https://img.shields.io/badge/Part%20of%20The%20Full%20Stack%20Observatory-Layer%202-orange)

[Layer 2: Backend / APIs](https://markusisaksson1982.github.io/layers/backend-apis/)

This repo contains the production version of the middleware pipeline demonstrated in the browser on the layer page.

## What This Server Does

`fullstack-api-server` is an Express.js REST API that preserves the same request flow shown in the Layer 2 demo:

`CORS -> Request Logger -> Rate Limiter -> Auth -> Validation -> Route Handler`

The API ships with:

- Exact Layer 2 middleware ordering
- Sliding-window rate limiting (`20 requests / 10 seconds`)
- Bearer token auth using the demo token `demo-token-2026`
- PostgreSQL-backed user CRUD
- Structured JSON errors
- Docker and GitHub Actions support

## Setup

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-api-server.git
cd fullstack-api-server
npm install
cp .env.example .env
docker compose up -d
npm start
```

The API starts on `http://localhost:3000`.

## Middleware Contract

The browser layer demonstrates six stages. This repo keeps the same stages in the same order:

1. `CORS`
2. `Request Logger`
3. `Metrics`
4. `Speed Insights`
5. `Rate Limiter`
6. `Auth`
7. `Validation`
8. `Route Handler`

To avoid inserting an extra app-level parser middleware into that flow, JSON parsing is handled inside the validation middleware for routes that accept bodies.

### Speed Insights

Vercel Speed Insights is integrated via middleware that automatically injects the tracking script into HTML responses. Since this is primarily a REST API server serving JSON, the Speed Insights middleware is dormant by default but will activate if HTML content is ever served.

To enable/disable Speed Insights:
- Set `speedInsightsEnabled` option when creating the app
- Or control via environment variable (future enhancement)

The middleware only affects HTML responses and has no impact on JSON API responses.

## Authentication

All `/api/users` routes require:

```http
Authorization: Bearer demo-token-2026
```

## API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check and runtime metadata |
| `GET` | `/api/users` | Yes | List all users |
| `GET` | `/api/users/:id` | Yes | Fetch one user |
| `POST` | `/api/users` | Yes | Create a user |
| `PUT` | `/api/users/:id` | Yes | Update a user |
| `DELETE` | `/api/users/:id` | Yes | Delete a user |

## Example Requests

```bash
curl http://localhost:3000/api/health
```

```bash
curl -H "Authorization: Bearer demo-token-2026" \
  http://localhost:3000/api/users
```

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-2026" \
  -d '{"name":"Linus Torvalds","role":"maintainer"}' \
  http://localhost:3000/api/users
```

## Environment

Copy `.env.example` to `.env` and update values as needed.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Runtime mode |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/fullstack_api_server` | PostgreSQL connection string |
| `AUTH_BEARER_TOKEN` | `demo-token-2026` | Demo token that matches the layer page |
| `JWT_SECRET` | `change-me` | Optional JWT verification secret |
| `RATE_LIMIT_MAX` | `20` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `10000` | Sliding window size |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |
| `LOG_LEVEL` | `info` | Pino log level |

## Cross-References

- Layer 3: [Database](https://markusisaksson1982.github.io/layers/database/)
- Layer 4: [Servers](https://markusisaksson1982.github.io/layers/servers/)
- Layer 8: [Security](https://markusisaksson1982.github.io/layers/security/)
- Layer 9: [Containers](https://markusisaksson1982.github.io/layers/containers/)

## Project Structure

```text
.
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── server.js
│   ├── app.js
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── requestLogger.js
│   │   ├── rateLimit.js
│   │   ├── authenticate.js
│   │   ├── speedInsights.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── health.js
│   │   └── users.js
│   ├── db/
│   │   └── pool.js
│   └── utils/
│       └── errors.js
├── tests/
│   ├── health.test.js
│   ├── users.test.js
│   └── middleware/
│       └── rateLimit.test.js
└── docs/
    └── ARCHITECTURE.md
```
