const jwt = require('jsonwebtoken');

const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

function createAuthenticate(options = {}) {
  const demoToken = options.demoToken || process.env.AUTH_BEARER_TOKEN || 'demo-token-2026';
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET;

  return function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new UnauthorizedError(
          `Missing or invalid Authorization header. Use: Bearer ${demoToken}`
        )
      );
    }

    const token = authHeader.slice(7).trim();

    if (token === demoToken) {
      req.user = {
        id: 1,
        name: 'Markus Isaksson',
        role: 'admin'
      };

      return next();
    }

    if (jwtSecret) {
      try {
        req.user = jwt.verify(token, jwtSecret);
        return next();
      } catch (error) {
        // Preserve the layer page contract for invalid tokens.
      }
    }

    return next(
      new ForbiddenError(`Invalid token. The demo token is: ${demoToken}`)
    );
  };
}

module.exports = createAuthenticate;
