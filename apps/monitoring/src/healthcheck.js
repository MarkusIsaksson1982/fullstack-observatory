const express = require("express");

const { logger: defaultLogger } = require("./logger");
const { setHealthStatus } = require("./metrics");

async function runDependencyChecks(dependencies = [], logger = defaultLogger) {
  const results = await Promise.all(
    dependencies.map(async (dependency) => {
      try {
        const outcome = await dependency.check();

        if (outcome === false) {
          const failure = {
            name: dependency.name,
            status: "error",
            details: "dependency reported not ready"
          };
          logger.warn({ dependency: failure }, "dependency readiness check failed");
          return failure;
        }

        if (outcome && typeof outcome === "object") {
          const normalized = {
            name: dependency.name,
            status: outcome.status || "ok",
            ...(outcome.details ? { details: outcome.details } : {})
          };

          if (normalized.status !== "ok") {
            logger.warn({ dependency: normalized }, "dependency readiness check failed");
          }

          return normalized;
        }

        return {
          name: dependency.name,
          status: "ok"
        };
      } catch (error) {
        const failure = {
          name: dependency.name,
          status: "error",
          details: error.message
        };
        logger.warn({ dependency: failure }, "dependency readiness check threw");
        return failure;
      }
    })
  );

  return {
    ready: results.every((result) => result.status === "ok"),
    dependencies: results
  };
}

function noStore(res) {
  res.set("Cache-Control", "no-store");
}

function createHealthcheckRouter(options = {}) {
  const logger = options.logger || defaultLogger;
  const serviceName = options.serviceName || process.env.SERVICE_NAME || "fullstack-monitoring";
  const version = options.version || process.env.npm_package_version || "0.0.0";
  const dependencies = options.dependencies || [];

  const router = express.Router();

  router.get("/health/live", (req, res) => {
    void req;
    setHealthStatus({ liveness: 1 });
    noStore(res);

    res.status(200).json({
      status: "ok",
      check: "liveness",
      service: serviceName,
      timestamp: new Date().toISOString()
    });
  });

  router.get("/health/ready", async (req, res) => {
    void req;

    const readiness = await runDependencyChecks(dependencies, logger);
    const statusCode = readiness.ready ? 200 : 503;

    setHealthStatus({
      liveness: 1,
      readiness: readiness.ready ? 1 : 0
    });

    noStore(res);

    res.status(statusCode).json({
      status: readiness.ready ? "ok" : "degraded",
      check: "readiness",
      service: serviceName,
      timestamp: new Date().toISOString(),
      dependencies: readiness.dependencies
    });
  });

  router.get("/health", async (req, res) => {
    void req;

    const readiness = await runDependencyChecks(dependencies, logger);
    const statusCode = readiness.ready ? 200 : 503;

    setHealthStatus({
      liveness: 1,
      readiness: readiness.ready ? 1 : 0
    });

    noStore(res);

    res.status(statusCode).json({
      status: readiness.ready ? "ok" : "degraded",
      service: serviceName,
      version,
      layer: 11,
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
      checks: {
        liveness: {
          status: "ok"
        },
        readiness: {
          status: readiness.ready ? "ok" : "error",
          dependencies: readiness.dependencies
        }
      }
    });
  });

  return router;
}

module.exports = {
  createHealthcheckRouter,
  runDependencyChecks
};
