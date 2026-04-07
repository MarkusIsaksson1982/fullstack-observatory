const { randomBytes } = require('crypto');

const pino = require('pino');

const defaultLogger = pino({
  name: 'fullstack-api-server',
  level: process.env.LOG_LEVEL || 'info',
  base: undefined
});

function buildRequestId() {
  return `req_${randomBytes(6).toString('base64url').slice(0, 8)}`;
}

function createRequestLogger(options = {}) {
  const baseLogger = options.logger || defaultLogger;

  return function requestLogger(req, res, next) {
    const requestId = buildRequestId();
    const requestTime = new Date().toISOString();
    const start = process.hrtime.bigint();

    req.requestId = requestId;
    req.requestTime = requestTime;
    req.log =
      typeof baseLogger.child === 'function'
        ? baseLogger.child({
            requestId,
            method: req.method,
            url: req.originalUrl || req.url
          })
        : baseLogger;

    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Request-Time', requestTime);

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

      if (req.log && typeof req.log.info === 'function') {
        req.log.info(
          {
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2))
          },
          'request completed'
        );
      }
    });

    next();
  };
}

module.exports = createRequestLogger;
module.exports.defaultLogger = defaultLogger;
