const express = require("express");

const createHelmetMiddleware = require("./middleware/helmet");
const createCorsMiddleware = require("./middleware/cors");
const createCspMiddleware = require("./middleware/csp");
const createRateLimitMiddleware = require("./middleware/rateLimit");
const exampleRouter = require("./routes/example");

function createApp(options = {}) {
  const app = express();

  app.disable("x-powered-by");

  app.use(createHelmetMiddleware());
  app.use(createCspMiddleware());
  app.use(
    createCorsMiddleware({
      allowlist: options.corsAllowlist
    })
  );
  app.use(
    createRateLimitMiddleware({
      max: options.rateLimitMax,
      windowMs: options.rateLimitWindowMs
    })
  );
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", exampleRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: "NotFound",
      message: `Cannot ${req.method} ${req.originalUrl}`
    });
  });

  app.use((err, req, res, next) => {
    void req;
    void next;

    const status = err.statusCode || err.status || 500;
    const message = status < 500 ? err.message : "Internal server error";

    if (status >= 500) {
      console.error("Unhandled error:", err.message);
    }

    res.status(status).json({
      error: err.name || "Error",
      message,
      ...(err.details ? { details: err.details } : {})
    });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const app = createApp();

  app.listen(port, () => {
    console.log(`fullstack-security-hardened listening on port ${port}`);
  });
}

module.exports = { createApp };
