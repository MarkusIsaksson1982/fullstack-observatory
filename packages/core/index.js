class AppError extends Error {
  constructor(
    message,
    {
      statusCode = 500,
      code = 'InternalError',
      details,
      expose = true,
      cause
    } = {}
  ) {
    super(message);
    this.name = code;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.expose = expose;

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { statusCode: 400, code: 'ValidationError', details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, { statusCode: 401, code: 'Unauthorized' });
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, { statusCode: 403, code: 'Forbidden' });
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, { statusCode: 404, code: 'NotFound' });
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, { statusCode: 429, code: 'TooManyRequests' });
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error', details) {
    super(message, { statusCode: 503, code: 'DatabaseError', details });
  }
}

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object') {
    const statusCode = error.statusCode ?? error.status ?? 500;

    return new AppError(error.message || 'Internal server error', {
      statusCode,
      code: error.code || error.name || 'InternalError',
      details: error.details,
      // Treat inferred 4xx errors as safe to expose; default unknowns to 5xx.
      expose: statusCode < 500
    });
  }

  return new AppError('Internal server error', { expose: false });
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  DatabaseError,
  normalizeError
};
