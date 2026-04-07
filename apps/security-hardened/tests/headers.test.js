const request = require("supertest");
const { createApp } = require("../src/app");

function getHeaderValue(headers, headerName) {
  switch (headerName) {
    case "content-security-policy":
      return headers["content-security-policy"];
    case "strict-transport-security":
      return headers["strict-transport-security"];
    case "x-content-type-options":
      return headers["x-content-type-options"];
    case "x-frame-options":
      return headers["x-frame-options"];
    case "referrer-policy":
      return headers["referrer-policy"];
    case "permissions-policy":
      return headers["permissions-policy"];
    default:
      return undefined;
  }
}

describe("Security headers", () => {
  const app = createApp({ corsAllowlist: ["http://localhost:3000"] });

  const expectedHeaders = [
    ["content-security-policy", /default-src 'self'/],
    ["strict-transport-security", /max-age=63072000/],
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", /DENY/i],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["permissions-policy", /camera=\(\)/]
  ];

  test.each(expectedHeaders)("sets %s header", async (headerName, expectedValue) => {
    const res = await request(app).get("/api/health");
    const actual = getHeaderValue(res.headers, headerName);

    expect(actual).toBeDefined();

    if (expectedValue instanceof RegExp) {
      expect(actual).toMatch(expectedValue);
    } else {
      expect(actual).toBe(expectedValue);
    }
  });

  test("does not expose X-Powered-By", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  test("sets X-XSS-Protection to 0 when present", async () => {
    const res = await request(app).get("/api/health");
    const value = res.headers["x-xss-protection"];

    if (value !== undefined) {
      expect(value).toBe("0");
    }
  });

  test("sets frame-ancestors in CSP", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-security-policy"]).toMatch(/frame-ancestors 'none'/);
  });
});
