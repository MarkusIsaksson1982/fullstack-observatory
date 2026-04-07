const request = require("supertest");
const { createApp } = require("../src/app");
const { escapeHtml } = require("../src/middleware/validateInput");

describe("XSS defense", () => {
  const app = createApp({ corsAllowlist: ["http://localhost:3000"] });
  const xssPayloads = [
    '<script>alert("xss")</script>',
    "<img src=x onerror=alert(1)>",
    '<div onmouseover="alert(1)">hover me</div>',
    "<style>body{background:red}</style>",
    "'; DROP TABLE users; --"
  ];

  describe("escapeHtml", () => {
    test.each(xssPayloads)("escapes payload: %s", (payload) => {
      const escaped = escapeHtml(payload);

      expect(escaped).not.toMatch(/<(?!\/)/);
      expect(escaped).not.toMatch(/"/);
    });

    test("preserves safe text", () => {
      expect(escapeHtml("Hello world")).toBe("Hello world");
    });

    test("escapes all five dangerous characters", () => {
      expect(escapeHtml('&<>"\'')).toBe("&amp;&lt;&gt;&quot;&#039;");
    });
  });

  describe("POST /api/echo", () => {
    test("rejects missing required fields", async () => {
      const res = await request(app).post("/api/echo").send({ email: "test@test.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ValidationError");
    });

    test("rejects invalid email format", async () => {
      const res = await request(app)
        .post("/api/echo")
        .send({ name: "Test", email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ValidationError");
    });

    test("escapes HTML in the name field", async () => {
      const res = await request(app)
        .post("/api/echo")
        .send({ name: "<script>alert(1)</script>", email: "test@test.com" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).not.toContain("<script>");
      expect(res.body.data.name).toContain("&lt;script&gt;");
    });

    test("rejects an invalid role enum", async () => {
      const res = await request(app)
        .post("/api/echo")
        .send({ name: "Test", email: "test@test.com", role: "superadmin" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/xss-test", () => {
    test("returns both raw and escaped versions", async () => {
      const payload = "<script>alert(1)</script>";
      const res = await request(app).get(`/api/xss-test?input=${encodeURIComponent(payload)}`);

      expect(res.status).toBe(200);
      expect(res.body.raw).toBe(payload);
      expect(res.body.escaped).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    });
  });
});
