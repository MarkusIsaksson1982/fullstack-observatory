function createCorsMiddleware(options = {}) {
  const defaultAllowlist = (process.env.CORS_ALLOWLIST || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowlist = options.allowlist || defaultAllowlist;

  return function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    const allowed = origin && allowlist.includes(origin);

    if (allowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Vary", "Origin");
      if (req.method === "OPTIONS") {
        return res.status(204).end();
      }
    } else if (req.method === "OPTIONS") {
      return res.status(403).json({ error: "Forbidden", message: "Origin not allowed" });
    }

    return next();
  };
}

module.exports = createCorsMiddleware;
