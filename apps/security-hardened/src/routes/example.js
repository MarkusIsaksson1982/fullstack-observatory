const express = require("express");
const { validate, escapeHtml } = require("../middleware/validateInput");

const router = express.Router();

router.get("/health", (req, res) => {
  void req;

  res.json({
    status: "ok",
    service: "fullstack-security-hardened",
    layer: 8,
    observatory: "https://markusisaksson1982.github.io/layers/security/",
    securityHeaders: {
      csp: "active",
      hsts: "active",
      xFrameOptions: "DENY",
      xContentTypeOptions: "nosniff",
      referrerPolicy: "strict-origin-when-cross-origin",
      permissionsPolicy: "active",
      xXssProtection: "0 (deprecated)"
    }
  });
});

router.post("/echo", validate("createUser"), (req, res) => {
  res.status(200).json({
    message: "Input validated and sanitized",
    data: req.validatedBody,
    note: "The name field has been HTML-entity-escaped to prevent XSS"
  });
});

router.get("/xss-test", (req, res) => {
  const userInput = req.query.input || '<script>alert("xss")</script>';

  res.json({
    raw: userInput,
    escaped: escapeHtml(userInput),
    safe: true,
    explanation:
      'The "escaped" field replaces < > " \' & with HTML entities. If rendered as innerHTML, escaped text appears as literal text, not executable code.'
  });
});

router.get("/headers", (req, res) => {
  void req;

  const headerNames = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "x-xss-protection"
  ];
  const headerEntries = [];

  for (const name of headerNames) {
    const value = res.getHeader(name);

    if (value) {
      headerEntries.push([name, value]);
    }
  }

  res.json({
    message: "These are the security headers set on every response",
    headers: Object.fromEntries(headerEntries),
    analyzerUrl: "https://markusisaksson1982.github.io/layers/security/",
    note: "Paste the raw response headers from any endpoint into the Layer 8 analyzer for a 100% score"
  });
});

module.exports = router;
