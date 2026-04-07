const request = require("supertest");
const { createApp } = require("../src/app");

describe("Rate limiting", () => {
  test("returns 429 when the limit is exceeded", async () => {
    const app = createApp({
      rateLimitMax: 3,
      rateLimitWindowMs: 60000,
      corsAllowlist: ["http://localhost:3000"]
    });

    for (let index = 0; index < 3; index += 1) {
      await request(app).get("/api/health");
    }

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(429);
    expect(res.body.error).toBe("TooManyRequests");
  });

  test("includes rate limit headers in the response", async () => {
    const app = createApp({
      rateLimitMax: 10,
      rateLimitWindowMs: 60000,
      corsAllowlist: ["http://localhost:3000"]
    });

    const res = await request(app).get("/api/health");
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });
});
