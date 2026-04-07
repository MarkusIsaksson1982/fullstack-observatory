# Architecture

## Overview

`fullstack-api-server` is the production companion for Layer 2 of The Full Stack Observatory. It translates the browser-native middleware demo into a real Express.js service backed by PostgreSQL while preserving the same conceptual request flow:

`CORS -> Request Logger -> Rate Limiter -> Auth -> Validation -> Route Handler`

## Request Lifecycle

1. `src/middleware/cors.js`
   Sets the same CORS headers shown in the layer page and responds to preflight requests.
2. `src/middleware/requestLogger.js`
   Attaches `X-Request-Id` and `X-Request-Time`, then emits structured logs through Pino.
3. `src/middleware/rateLimit.js`
   Implements a sliding-window limiter with the same Layer 2 defaults: `20 requests / 10000 ms`.
4. `src/middleware/authenticate.js`
   Accepts `Bearer demo-token-2026` to mirror the demo. If `JWT_SECRET` is configured, verified JWTs are also accepted.
5. `src/middleware/validate.js`
   Parses JSON and validates request bodies without inserting a separate app-level parser, which keeps the visible middleware chain aligned with the layer page.
6. Route handlers
   `src/routes/health.js` serves runtime health. `src/routes/users.js` provides CRUD over PostgreSQL.

## Data Model

The runtime database consists of a single `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);
```

On startup, the server seeds the table with the same demo users used by the browser layer when the table is empty:

- Ada Lovelace
- Alan Turing
- Grace Hopper

## Module Layout

- `src/server.js`
  Loads `.env`, initializes PostgreSQL, and starts the HTTP server.
- `src/app.js`
  Wires middleware, routes, 404 handling, and structured error responses.
- `src/db/pool.js`
  Owns the shared `pg` pool plus bootstrap and health helpers.
- `src/utils/errors.js`
  Centralizes typed application errors.

## Operational Notes

- The service expects PostgreSQL to be available before startup.
- `docker-compose.yml` provisions PostgreSQL for local development.
- `Dockerfile` builds a production image for Layer 9 container workflows.
- `.github/workflows/ci.yml` runs lint and tests on every push and pull request, then builds the Docker image only when `Dockerfile` changes.

## Layer Links

- Layer 2: https://markusisaksson1982.github.io/layers/backend-apis/
- Layer 3: https://markusisaksson1982.github.io/layers/database/
- Layer 4: https://markusisaksson1982.github.io/layers/servers/
- Layer 8: https://markusisaksson1982.github.io/layers/security/
- Layer 9: https://markusisaksson1982.github.io/layers/containers/
