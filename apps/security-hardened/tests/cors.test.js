const request = require("supertest");
const { createApp } = require("../src/app");

describe("CORS allowlist", () => {
  const allowed = ["https://your-app.com", "http://localhost:3000"];
  const app = createApp({ corsAllowlist: allowed });

  test("allows requests from an allowlisted origin", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://your-app.com");

    expect(res.headers["access-control-allow-origin"]).toBe("https://your-app.com");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.headers.vary).toMatch(/Origin/);
  });

  test("allows localhost in development", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://localhost:3000");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  test("blocks requests from a non-allowlisted origin", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://evil.com");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("handles preflight OPTIONS correctly for an allowed origin", async () => {
    const res = await request(app)
      .options("/api/health")
      .set("Origin", "https://your-app.com")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-methods"]).toMatch(/POST/);
  });

  test("rejects preflight OPTIONS from a non-allowlisted origin", async () => {
    const res = await request(app)
      .options("/api/health")
      .set("Origin", "https://evil.com")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden", message: "Origin not allowed" });
  });

  test("never uses wildcard for Access-Control-Allow-Origin", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://your-app.com");
    expect(res.headers["access-control-allow-origin"]).not.toBe("*");
  });
});
