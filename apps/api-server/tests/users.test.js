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

function createMemoryUserStore() {
  const users = [
    { id: 1, name: 'Ada Lovelace', role: 'engineer', created: '1843-01-01' },
    { id: 2, name: 'Alan Turing', role: 'architect', created: '1936-06-15' },
    { id: 3, name: 'Grace Hopper', role: 'lead', created: '1952-03-01' }
  ];
  let nextId = 4;

  function clone(user) {
    return user ? { ...user } : null;
  }

  return {
    async list() {
      return users.map(clone);
    },

    async getById(id) {
      return clone(users.find((user) => user.id === id));
    },

    async create(input) {
      const user = {
        id: nextId++,
        name: input.name,
        role: input.role || 'member',
        created: '2026-03-28'
      };

      users.push(user);
      return clone(user);
    },

    async update(id, changes) {
      const user = users.find((candidate) => candidate.id === id);

      if (!user) {
        return null;
      }

      Object.assign(user, changes);
      return clone(user);
    },

    async remove(id) {
      const index = users.findIndex((candidate) => candidate.id === id);

      if (index === -1) {
        return null;
      }

      const [removed] = users.splice(index, 1);
      return clone(removed);
    }
  };
}

function createTestApp() {
  process.env.AUTH_BEARER_TOKEN = 'demo-token-2026';

  return createApp({
    logger: createSilentLogger(),
    getDatabaseStatus: async () => 'up',
    userStore: createMemoryUserStore(),
    rateLimitMax: 100
  });
}

describe('/api/users', () => {
  test('rejects missing auth with the layer page message', async () => {
    const app = createTestApp();
    const response = await request(app).get('/api/users');

    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message:
        'Missing or invalid Authorization header. Use: Bearer demo-token-2026'
    });
  });

  test('supports full CRUD with the demo bearer token', async () => {
    const app = createTestApp();
    const authHeader = { Authorization: 'Bearer demo-token-2026' };

    const listResponse = await request(app).get('/api/users').set(authHeader);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.count).toBe(3);

    const getResponse = await request(app).get('/api/users/1').set(authHeader);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.data).toMatchObject({
      id: 1,
      name: 'Ada Lovelace'
    });

    const createResponse = await request(app)
      .post('/api/users')
      .set({
        ...authHeader,
        'Content-Type': 'application/json'
      })
      .send({ name: 'Linus Torvalds', role: 'maintainer' });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body).toMatchObject({
      message: 'User created successfully'
    });
    expect(createResponse.body.data).toMatchObject({
      id: 4,
      name: 'Linus Torvalds',
      role: 'maintainer'
    });

    const updateResponse = await request(app)
      .put('/api/users/2')
      .set({
        ...authHeader,
        'Content-Type': 'application/json'
      })
      .send({ role: 'legend' });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toMatchObject({
      message: 'User updated'
    });
    expect(updateResponse.body.data).toMatchObject({
      id: 2,
      role: 'legend'
    });

    const deleteResponse = await request(app)
      .delete('/api/users/3')
      .set(authHeader);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toMatchObject({
      message: 'User deleted'
    });
    expect(deleteResponse.body.data).toMatchObject({
      id: 3,
      name: 'Grace Hopper'
    });
  });

  test('validates required request body fields', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/api/users')
      .set({
        Authorization: 'Bearer demo-token-2026',
        'Content-Type': 'application/json'
      })
      .send({ role: 'maintainer' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      error: 'ValidationError',
      message: 'Missing required field: "name"'
    });
  });
});
