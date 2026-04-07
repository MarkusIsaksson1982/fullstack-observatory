const { PassThrough } = require("stream");

const { createLogger } = require("../src/logger");

function createCapturedLogger() {
  const stream = new PassThrough();
  const chunks = [];

  stream.on("data", (chunk) => {
    chunks.push(chunk.toString("utf8"));
  });

  const logger = createLogger({
    serviceName: "test-service",
    environment: "test",
    destination: stream
  });

  return {
    logger,
    readLastEntry() {
      const lines = chunks
        .join("")
        .split(/\r?\n/)
        .filter(Boolean);

      return JSON.parse(lines[lines.length - 1]);
    }
  };
}

describe("logger", () => {
  test("writes structured JSON with service metadata", () => {
    const capture = createCapturedLogger();

    capture.logger.info(
      {
        event: "request.completed",
        statusCode: 200
      },
      "request completed"
    );

    const entry = capture.readLastEntry();

    expect(entry.level).toBe("info");
    expect(entry.service).toBe("test-service");
    expect(entry.environment).toBe("test");
    expect(entry.layer).toBe(11);
    expect(entry.event).toBe("request.completed");
    expect(entry.statusCode).toBe(200);
    expect(entry.message).toBe("request completed");
    expect(entry.time).toBeDefined();
  });

  test("redacts secrets before writing logs", () => {
    const capture = createCapturedLogger();

    capture.logger.info(
      {
        authorization: "Bearer secret-token",
        password: "super-secret",
        headers: {
          authorization: "Bearer secret-token"
        }
      },
      "sensitive log"
    );

    const entry = capture.readLastEntry();

    expect(entry.authorization).toBe("[Redacted]");
    expect(entry.password).toBe("[Redacted]");
    expect(entry.headers.authorization).toBe("[Redacted]");
  });
});
