const express = require('express');

const createAuthenticate = require('./middleware/authenticate');
const createCors = require('./middleware/cors');
const createRateLimit = require('./middleware/rateLimit');
const createRequestLogger = require('./middleware/requestLogger');
const createValidate = require('./middleware/validate');
const createHealthRouter = require('./routes/health');
const { createUsersRouter } = require('./routes/users');
const { NotFoundError, normalizeError } = require('./utils/errors');

// ──────────────────────────────────────────────────────────────
// NEW: Shared Prometheus metrics from the observatory
// ──────────────────────────────────────────────────────────────
const { metricsMiddleware, metricsEndpoint } = require('@observatory/metrics');

function createApp(options = {}) {
  const app = express();
  const authenticate = options.authenticate || createAuthenticate(options.auth);
  const validate = options.validate || createValidate;
  const rateLimitMax = Number(
    options.rateLimitMax || process.env.RATE_LIMIT_MAX || 20
  );
  const rateLimitWindowMs = Number(
    options.rateLimitWindowMs || process.env.RATE_LIMIT_WINDOW_MS || 10000
  );

  app.disable('x-powered-by');

  app.use(createCors({ origin: options.corsOrigin }));
  app.use(createRequestLogger({ logger: options.logger }));

  // NEW: Metrics middleware (placed early so it captures ALL requests)
  app.use(metricsMiddleware);

  app.use(
    createRateLimit({
      max: rateLimitMax,
      windowMs: rateLimitWindowMs,
      store: options.rateLimitStore,
      keyGenerator: options.rateLimitKeyGenerator
    })
  );

  app.use(
    '/api/health',
    createHealthRouter({
      getDatabaseStatus: options.getDatabaseStatus
    })
  );

  app.use(
    '/api/users',
    createUsersRouter({
      userStore: options.userStore,
      authenticate,
      validate
    })
  );

  // NEW: Prometheus metrics endpoint (placed before 404 handler)
  app.get('/metrics', metricsEndpoint);

  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  app.use((error, req, res, next) => {
    const normalizedError = normalizeError(error);
    const statusCode = normalizedError.statusCode || 500;

    if (res.headersSent) {
      return next(normalizedError);
    }

    if (
      statusCode >= 500 &&
      req.log &&
      typeof req.log.error === 'function'
    ) {
      req.log.error(
        {
          err: {
            name: normalizedError.name,
            message: normalizedError.message,
            statusCode
          }
        },
        'request failed'
      );
    }

    return res.status(statusCode).json({
      error: normalizedError.code || normalizedError.name || 'InternalError',
      message:
        normalizedError.expose === false
          ? 'Internal server error'
          : normalizedError.message,
      statusCode,
      requestId: req.requestId || null,
      ...(normalizedError.details ? { details: normalizedError.details } : {})
    });
  });

  return app;
}

module.exports = {
  createApp
};