const request = require('supertest');

const { createApp } = require('../src/app');

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

describe('GET /api/health', () => {
  test('returns service metadata and middleware headers without auth', async () => {
    const app = createApp({
      logger: createSilentLogger(),
      getDatabaseStatus: async () => 'up',
      userStore: createNoopUserStore(),
      rateLimitMax: 100
    });

    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      framework: 'Express.js',
      database: 'up',
      service: 'fullstack-api-server'
    });
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['x-request-id']).toMatch(/^req_/);
    expect(response.headers['x-request-time']).toBeTruthy();
    expect(response.headers['x-ratelimit-limit']).toBe('100');
  });
});
