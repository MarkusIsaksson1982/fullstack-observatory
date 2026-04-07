const express = require('express');

const { query } = require('../db/pool');
const { NotFoundError } = require('../utils/errors');

function mapUserRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    role: row.role,
    created: row.created
  };
}

function createPostgresUserStore(options = {}) {
  const queryFn = options.queryFn || query;

  const store = {
    async list() {
      const result = await queryFn(`
        SELECT
          id,
          name,
          role,
          TO_CHAR(created_at, 'YYYY-MM-DD') AS created
        FROM users
        ORDER BY id ASC;
      `);

      return result.rows.map(mapUserRow);
    },

    async getById(id) {
      const result = await queryFn(
        `
          SELECT
            id,
            name,
            role,
            TO_CHAR(created_at, 'YYYY-MM-DD') AS created
          FROM users
          WHERE id = $1;
        `,
        [id]
      );

      return result.rows[0] ? mapUserRow(result.rows[0]) : null;
    },

    async create(input) {
      const result = await queryFn(
        `
          INSERT INTO users (name, role)
          VALUES ($1, $2)
          RETURNING
            id,
            name,
            role,
            TO_CHAR(created_at, 'YYYY-MM-DD') AS created;
        `,
        [input.name, input.role || 'member']
      );

      return mapUserRow(result.rows[0]);
    },

    async update(id, changes) {
      const existing = await store.getById(id);

      if (!existing) {
        return null;
      }

      const nextName =
        Object.prototype.hasOwnProperty.call(changes, 'name')
          ? changes.name
          : existing.name;
      const nextRole =
        Object.prototype.hasOwnProperty.call(changes, 'role')
          ? changes.role
          : existing.role;

      const result = await queryFn(
        `
          UPDATE users
          SET name = $2, role = $3
          WHERE id = $1
          RETURNING
            id,
            name,
            role,
            TO_CHAR(created_at, 'YYYY-MM-DD') AS created;
        `,
        [id, nextName, nextRole]
      );

      return mapUserRow(result.rows[0]);
    },

    async remove(id) {
      const result = await queryFn(
        `
          DELETE FROM users
          WHERE id = $1
          RETURNING
            id,
            name,
            role,
            TO_CHAR(created_at, 'YYYY-MM-DD') AS created;
        `,
        [id]
      );

      return result.rows[0] ? mapUserRow(result.rows[0]) : null;
    }
  };

  return store;
}

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createUsersRouter(options = {}) {
  const authenticate = options.authenticate;
  const validate = options.validate;
  const userStore = options.userStore || createPostgresUserStore();

  if (typeof authenticate !== 'function') {
    throw new Error('authenticate middleware must be provided');
  }

  if (typeof validate !== 'function') {
    throw new Error('validate middleware factory must be provided');
  }

  const router = express.Router();

  router.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
      const users = await userStore.list();

      res.json({
        data: users,
        count: users.length,
        meta: {
          page: 1,
          perPage: 20
        }
      });
    })
  );

  router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
      const user = await userStore.getById(Number(req.params.id));

      if (!user) {
        throw new NotFoundError(`User #${req.params.id} not found`);
      }

      res.json({ data: user });
    })
  );

  router.post(
    '/',
    authenticate,
    validate({
      name: { required: true, type: 'string' },
      role: { required: false, type: 'string' }
    }),
    asyncHandler(async (req, res) => {
      const user = await userStore.create(req.body);

      res.status(201).json({
        data: user,
        message: 'User created successfully'
      });
    })
  );

  router.put(
    '/:id',
    authenticate,
    validate({
      name: { required: false, type: 'string' },
      role: { required: false, type: 'string' }
    }),
    asyncHandler(async (req, res) => {
      const user = await userStore.update(Number(req.params.id), req.body);

      if (!user) {
        throw new NotFoundError(`User #${req.params.id} not found`);
      }

      res.json({
        data: user,
        message: 'User updated'
      });
    })
  );

  router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
      const user = await userStore.remove(Number(req.params.id));

      if (!user) {
        throw new NotFoundError(`User #${req.params.id} not found`);
      }

      res.json({
        data: user,
        message: 'User deleted'
      });
    })
  );

  return router;
}

module.exports = {
  createUsersRouter,
  createPostgresUserStore
};
