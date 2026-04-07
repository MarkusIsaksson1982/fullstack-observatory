# Observability - Layer 11

Observability is the ability to infer the internal state of a system from the
signals it emits. The Layer 11 page demonstrates that idea in the browser with
Performance APIs. This repo is the server-side companion.

## The Three Pillars

### Metrics

Metrics answer, "what is happening right now?"

This repo exposes Prometheus metrics on `/metrics`, including:

- request volume
- request latency
- readiness and liveness state
- default Node.js process metrics such as memory and event loop behavior

Metrics are cheap to aggregate and ideal for dashboards, SLOs, and alerts.

### Logs

Logs answer, "what happened for this specific event?"

`src/logger.js` emits structured JSON through Pino, and
`src/middleware/requestLogger.js` records each completed HTTP request with:

- request ID
- method and route
- status code
- duration
- remote address

Secret-bearing fields such as `authorization`, `cookie`, `password`, and
`token` are redacted before they leave the process.

### Traces

Traces answer, "how did this request move through the system?"

This repo does not include a full tracing backend, but it is ready for one:

- request IDs are attached in middleware
- structured logs keep correlation fields stable
- health checks are dependency aware

The next step is adding OpenTelemetry spans and exporting them to a trace store
such as Tempo, Jaeger, or an APM provider.

## Monitoring vs. Observability

Monitoring is the act of collecting known signals and alerting on known failure
modes. Observability goes further: it gives you enough context to investigate
unknown failures too.

This repo covers both:

- monitoring: dashboards, alerts, health checks, Prometheus rules
- observability: structured logs, correlation fields, dependency-aware readiness

## Recommended Alert Thresholds

The included alert rules focus on the thresholds most teams act on first:

- service unreachable for 1 minute
- readiness failing for 2 minutes
- p95 latency above 500 ms for 5 minutes
- 5xx rate above 5% for 5 minutes

Those thresholds are intentionally simple. Tighten them after you have real
baseline traffic and latency data.
