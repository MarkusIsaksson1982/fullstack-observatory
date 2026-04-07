const rateLimit = require("express-rate-limit");

function createRateLimitMiddleware(options = {}) {
  const max = Number(options.max || process.env.RATE_LIMIT_MAX || 30);
  const windowMs = Number(options.windowMs || process.env.RATE_LIMIT_WINDOW_MS || 60000);

  return rateLimit({
    max,
    windowMs,
    standardHeaders: true,
    legacyHeaders: true,
    message: {
      error: "TooManyRequests",
      message: "Rate limit exceeded. Try again shortly.",
      retryAfterMs: windowMs
    }
  });
}

module.exports = createRateLimitMiddleware;
