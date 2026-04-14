# Start Here

This repository is easiest to understand if you review it with a purpose instead of opening random folders.

## Fast Paths

- Recruiters: read [RECRUITER_SUMMARY.md](RECRUITER_SUMMARY.md)
- Engineers: read [README.md](README.md), then [ARCHITECTURE.md](ARCHITECTURE.md)
- Hands-on reviewers: follow [COMPOSE.md](COMPOSE.md) and run the full stack locally

## 5-Minute Walkthrough

1. Read [RECRUITER_SUMMARY.md](RECRUITER_SUMMARY.md) for the short version.
2. Open [ARCHITECTURE.md](ARCHITECTURE.md) to see how the 12 layers fit together.
3. Inspect [docker-compose.fullstack.yml](docker-compose.fullstack.yml) to see the runnable system boundary.
4. Inspect the API entrypoint in [apps/api-server/src/app.js](apps/api-server/src/app.js) and the shared error model in [packages/core/index.js](packages/core/index.js).
5. Inspect observability in [packages/metrics/index.js](packages/metrics/index.js) and [grafana/provisioning](grafana/provisioning).

## Suggested Review Order

- [README.md](README.md): high-level overview and quickstart
- [docker-compose.fullstack.yml](docker-compose.fullstack.yml): what actually runs
- [apps/api-server](apps/api-server): production Express API
- [apps/database/migrations](apps/database/migrations): schema design and constraints
- [apps/server-configs](apps/server-configs): nginx, PM2, systemd deployment layer
- [apps/security-hardened](apps/security-hardened): focused security examples with tests
- [apps/monitoring](apps/monitoring): logging, health checks, metrics
- [grafana/provisioning](grafana/provisioning): dashboards and datasource wiring

## If You Want to Run It

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-observatory.git
cd fullstack-observatory
cp .env.example .env
npm install
npm run compose
```

Then open:

- `http://localhost` for the API entrypoint
- `http://localhost:3001` for Grafana
- `http://localhost:9090` for Prometheus

## Public Explorer

The public-facing interactive companion site lives at:

- [markusisaksson1982.github.io](https://markusisaksson1982.github.io/)

That site explains the same architecture visually and links back to the implementation.
