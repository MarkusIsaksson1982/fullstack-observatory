const { randomUUID } = require("crypto");

const { logger: defaultLogger } = require("../logger");
const { getRouteLabel, observeHttpRequest } = require("../metrics");

function getDurationSeconds(startedAt) {
  return Number(process.hrtime.bigint() - startedAt) / 1e9;
}

function getContentLength(res) {
  const header = res.getHeader("content-length");
  const value = Number(header);
  return Number.isFinite(value) ? value : undefined;
}

function createRequestLogger(options = {}) {
  const baseLogger = options.logger || defaultLogger;

  return function requestLogger(req, res, next) {
    const startedAt = process.hrtime.bigint();
    const requestId = req.headers["x-request-id"] || randomUUID();

    req.id = requestId;
    req.log = baseLogger.child({
      requestId,
      method: req.method,
      path: req.path
    });

    res.setHeader("x-request-id", requestId);

    let completed = false;

    res.on("finish", () => {
      completed = true;

      const durationSeconds = getDurationSeconds(startedAt);
      const route = getRouteLabel(req);

      observeHttpRequest({
        method: req.method,
        route,
        statusCode: res.statusCode,
        durationSeconds
      });

      req.log.info(
        {
          event: "http.request.completed",
          route,
          statusCode: res.statusCode,
          durationMs: Number((durationSeconds * 1000).toFixed(2)),
          contentLength: getContentLength(res),
          remoteAddress: req.ip,
          userAgent: req.headers["user-agent"]
        },
        "request completed"
      );
    });

    res.on("close", () => {
      if (completed || res.writableEnded) {
        return;
      }

      const durationSeconds = getDurationSeconds(startedAt);

      req.log.warn(
        {
          event: "http.request.aborted",
          statusCode: res.statusCode,
          durationMs: Number((durationSeconds * 1000).toFixed(2)),
          remoteAddress: req.ip
        },
        "request aborted"
      );
    });

    next();
  };
}

module.exports = {
  createRequestLogger
};
