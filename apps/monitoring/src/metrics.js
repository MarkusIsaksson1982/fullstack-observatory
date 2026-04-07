const client = require("prom-client");

const METRIC_PREFIX = "fullstack_monitoring_";

const registry = new client.Registry();

client.collectDefaultMetrics({
  prefix: METRIC_PREFIX,
  register: registry
});

const httpRequestsTotal = new client.Counter({
  name: `${METRIC_PREFIX}http_requests_total`,
  help: "Total number of HTTP requests handled by the application.",
  labelNames: ["method", "route", "status_code"],
  registers: [registry]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: `${METRIC_PREFIX}http_request_duration_seconds`,
  help: "HTTP request latency in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});

const appReadinessStatus = new client.Gauge({
  name: `${METRIC_PREFIX}app_readiness_status`,
  help: "Application readiness status. 1 = ready, 0 = not ready.",
  registers: [registry]
});

const appLivenessStatus = new client.Gauge({
  name: `${METRIC_PREFIX}app_liveness_status`,
  help: "Application liveness status. 1 = live, 0 = not live.",
  registers: [registry]
});

appReadinessStatus.set(1);
appLivenessStatus.set(1);

function getRouteLabel(req) {
  if (req.route && req.route.path) {
    const routePath = Array.isArray(req.route.path)
      ? req.route.path.join("|")
      : req.route.path;

    return `${req.baseUrl || ""}${routePath}` || routePath;
  }

  if (req.baseUrl && req.path) {
    return `${req.baseUrl}${req.path}`;
  }

  if (req.path) {
    return req.path;
  }

  if (req.originalUrl) {
    return req.originalUrl.split("?")[0];
  }

  return "unmatched";
}

function observeHttpRequest({ method, route, statusCode, durationSeconds }) {
  const labels = {
    method: String(method || "UNKNOWN").toUpperCase(),
    route: route || "unmatched",
    status_code: String(statusCode || 0)
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
}

function setHealthStatus({ readiness, liveness }) {
  if (typeof readiness === "number") {
    appReadinessStatus.set(readiness);
  }

  if (typeof liveness === "number") {
    appLivenessStatus.set(liveness);
  }
}

async function metricsHandler(req, res) {
  void req;
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
}

function resetMetrics() {
  registry.resetMetrics();
  appReadinessStatus.set(1);
  appLivenessStatus.set(1);
}

module.exports = {
  METRIC_PREFIX,
  registry,
  metricsHandler,
  observeHttpRequest,
  setHealthStatus,
  resetMetrics,
  getRouteLabel,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  appReadinessStatus,
  appLivenessStatus
};
