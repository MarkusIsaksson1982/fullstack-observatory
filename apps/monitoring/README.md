# fullstack-monitoring - Layer 11

[![Part of The Full Stack Observatory](https://img.shields.io/badge/Observatory-Layer_11-2bb3a3)](https://markusisaksson1982.github.io/layers/monitoring-logging/)

Monitoring, structured logging, health checks, and alerting configuration for
[The Full Stack Observatory](https://markusisaksson1982.github.io/layers/monitoring-logging/).

The browser dashboard on the Layer 11 page monitors itself with Performance APIs.
This repo shows the server-side equivalent: structured JSON logs, Prometheus
metrics, readiness and liveness endpoints, and alert rules for common failure modes.

## What Is Included

- Pino-based JSON logging with secret redaction
- Express-compatible request logging middleware
- `/health`, `/health/live`, and `/health/ready` endpoints
- `/metrics` endpoint for Prometheus scraping
- Prometheus + Grafana local monitoring stack
- Alert rules for downtime, readiness failures, high latency, and elevated 5xx rate

## Quick Start

```bash
npm install
npm test
```

Wire the modules into an Express app:

```javascript
const express = require("express");

const { logger } = require("./src/logger");
const { createHealthcheckRouter } = require("./src/healthcheck");
const { metricsHandler } = require("./src/metrics");
const { createRequestLogger } = require("./src/middleware/requestLogger");

const app = express();

app.use(createRequestLogger({ logger }));

app.use(
  createHealthcheckRouter({
    serviceName: "fullstack-api-server",
    version: "1.0.0",
    dependencies: [
      {
        name: "postgres",
        check: async () => ({ status: "ok", details: "connected" })
      },
      {
        name: "redis",
        check: async () => true
      }
    ]
  })
);

app.get("/metrics", metricsHandler);

app.get("/", (req, res) => {
  req.log.info({ event: "homepage.view" }, "homepage requested");
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  logger.info({ port: 3000 }, "monitoring example listening");
});
```

Run the local Prometheus + Grafana stack:

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

Prometheus will scrape `http://host.docker.internal:3000/metrics` by default.
Grafana runs on `http://localhost:3001` with `admin / admin`.

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) - integrate these modules into your application server
- [Layer 4: Servers](https://markusisaksson1982.github.io/layers/servers/) - terminate traffic cleanly and expose health checks to reverse proxies
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - containerize the app and run the monitoring stack alongside it
