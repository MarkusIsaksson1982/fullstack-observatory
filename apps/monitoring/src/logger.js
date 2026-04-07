const pino = require("pino");

const DEFAULT_REDACT_PATHS = [
  "authorization",
  "cookie",
  "password",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "headers.authorization",
  "headers.cookie",
  "req.headers.authorization",
  "req.headers.cookie"
];

function createLogger(options = {}) {
  const {
    level = process.env.LOG_LEVEL || "info",
    serviceName = process.env.SERVICE_NAME || "fullstack-monitoring",
    environment = process.env.NODE_ENV || "development",
    destination,
    additionalRedactPaths = [],
    ...pinoOptions
  } = options;

  return pino(
    {
      level,
      messageKey: "message",
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service: serviceName,
        environment,
        layer: 11
      },
      formatters: {
        level(label) {
          return { level: label };
        }
      },
      redact: {
        paths: [...DEFAULT_REDACT_PATHS, ...additionalRedactPaths],
        censor: "[Redacted]"
      },
      ...pinoOptions
    },
    destination
  );
}

const logger = createLogger();

module.exports = {
  createLogger,
  logger,
  DEFAULT_REDACT_PATHS
};
