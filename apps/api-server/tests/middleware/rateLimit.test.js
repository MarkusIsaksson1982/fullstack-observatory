const request = require('supertest');

const { createApp } = require('../../src/app');
const {
  SlidingWindowStore
} = require('../../src/middleware/rateLimit');

function createSilentLogger() {
  return {
    child() {
      return this;
    },
    info() {},
    error() {}
  };
}

function createNoopUserStore() {
  return {
    async list() {
      return [];
    },
    async getById() {
      return null;
    },
    async create() {
      return null;
    },
    async update() {
      return null;
    },
    async remove() {
      return null;
    }
  };
}

describe('sliding-window rate limiter', () => {
  test('blocks the next request when the window is exhausted and resets after the window', async () => {
    let now = 0;
    const store = new SlidingWindowStore({
      now: () => now
    });
    const app = createApp({
      logger: createSilentLogger(),
      getDatabaseStatus: async () => 'up',
      userStore: createNoopUserStore(),
      rateLimitMax: 2,
      rateLimitWindowMs: 1000,
      rateLimitStore: store
    });

    const first = await request(app).get('/api/health');
    expect(first.statusCode).toBe(200);
    expect(first.headers['x-ratelimit-limit']).toBe('2');
    expect(first.headers['x-ratelimit-remaining']).toBe('1');

    const second = await request(app).get('/api/health');
    expect(second.statusCode).toBe(200);
    expect(second.headers['x-ratelimit-remaining']).toBe('0');

    const limited = await request(app).get('/api/health');
    expect(limited.statusCode).toBe(429);
    expect(limited.body).toMatchObject({
      error: 'TooManyRequests',
      message: 'Rate limit exceeded. Try again shortly.'
    });
    expect(limited.headers['retry-after']).toBe('1');

    now = 1001;

    const recovered = await request(app).get('/api/health');
    expect(recovered.statusCode).toBe(200);
    expect(recovered.headers['x-ratelimit-remaining']).toBe('1');
  });
});
