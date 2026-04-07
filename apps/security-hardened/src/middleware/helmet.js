const helmet = require("helmet");

function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xXssProtection: false,
    hidePoweredBy: true
  });
}

module.exports = createHelmetMiddleware;
