const { TooManyRequestsError } = require('../utils/errors');

class SlidingWindowStore {
  constructor(options = {}) {
    this.hits = new Map();
    this.now = options.now || (() => Date.now());
  }

  prune(key, windowMs, currentTime = this.now()) {
    const cutoff = currentTime - windowMs;
    const activeHits = (this.hits.get(key) || []).filter((timestamp) => {
      return timestamp > cutoff;
    });

    if (activeHits.length > 0) {
      this.hits.set(key, activeHits);
    } else {
      this.hits.delete(key);
    }

    return activeHits;
  }

  count(key, windowMs, currentTime = this.now()) {
    return this.prune(key, windowMs, currentTime).length;
  }

  add(key, windowMs, currentTime = this.now()) {
    const activeHits = this.prune(key, windowMs, currentTime);
    activeHits.push(currentTime);
    this.hits.set(key, activeHits);
    return activeHits.length;
  }
}

function defaultKeyGenerator(req) {
  return `${req.ip || 'anonymous'}:${req.method}:${req.originalUrl || req.url}`;
}

function createRateLimit(options = {}) {
  const max = Number(options.max || 20);
  const windowMs = Number(options.windowMs || 10000);
  const store = options.store || new SlidingWindowStore();
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;

  return function rateLimit(req, res, next) {
    const currentTime =
      typeof store.now === 'function' ? store.now() : Date.now();
    const key = keyGenerator(req);
    const currentCount = store.count(key, windowMs, currentTime);

    if (currentCount >= max) {
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));

      return next(
        new TooManyRequestsError('Rate limit exceeded. Try again shortly.')
      );
    }

    const nextCount = store.add(key, windowMs, currentTime);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(max - nextCount));

    return next();
  };
}

module.exports = createRateLimit;
module.exports.SlidingWindowStore = SlidingWindowStore;
module.exports.defaultKeyGenerator = defaultKeyGenerator;
