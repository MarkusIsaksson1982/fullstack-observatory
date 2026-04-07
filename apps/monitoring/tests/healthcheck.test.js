const express = require("express");
const request = require("supertest");

const { createHealthcheckRouter } = require("../src/healthcheck");
const { resetMetrics } = require("../src/metrics");

function buildApp(options = {}) {
  const app = express();

  app.use(
    createHealthcheckRouter({
      serviceName: "test-service",
      version: "1.2.3",
      ...options
    })
  );

  return app;
}

describe("healthcheck router", () => {
  beforeEach(() => {
    resetMetrics();
  });

  test("returns combined health when dependencies are ready", async () => {
    const app = buildApp({
      dependencies: [
        {
          name: "postgres",
          check: async () => ({ status: "ok", details: "connected" })
        }
      ]
    });

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("test-service");
    expect(res.body.version).toBe("1.2.3");
    expect(res.body.checks.liveness.status).toBe("ok");
    expect(res.body.checks.readiness.dependencies[0]).toEqual(
      expect.objectContaining({
        name: "postgres",
        status: "ok"
      })
    );
  });

  test("returns 503 on readiness failure", async () => {
    const app = buildApp({
      dependencies: [
        {
          name: "redis",
          check: async () => false
        }
      ]
    });

    const res = await request(app).get("/health/ready");

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.dependencies[0]).toEqual(
      expect.objectContaining({
        name: "redis",
        status: "error"
      })
    );
  });

  test("keeps liveness green even if readiness is degraded", async () => {
    const app = buildApp({
      dependencies: [
        {
          name: "postgres",
          check: async () => {
            throw new Error("database offline");
          }
        }
      ]
    });

    const res = await request(app).get("/health/live");

    expect(res.status).toBe(200);
    expect(res.body.check).toBe("liveness");
    expect(res.body.status).toBe("ok");
  });
});
