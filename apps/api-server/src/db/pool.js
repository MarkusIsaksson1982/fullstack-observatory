const { Pool } = require('pg');

const { DatabaseError } = require('../utils/errors');

let pool;

function createPoolConfig() {
  return {
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/fullstack_api_server',
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

function getPool() {
  if (!pool) {
    pool = new Pool(createPoolConfig());
    pool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error', error);
    });
  }

  return pool;
}

async function query(text, params) {
  try {
    return await getPool().query(text, params);
  } catch (error) {
    throw new DatabaseError('Database query failed', {
      message: error.message
    });
  }
}

async function initializeDatabase() {
  const client = await getPool().connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await client.query(
      'SELECT COUNT(*)::integer AS count FROM users;'
    );

    if (result.rows[0].count === 0) {
      await client.query(`
        INSERT INTO users (name, role, email, created_at)
        VALUES
          ('Ada Lovelace', 'engineer', NULL, '1843-01-01'),
          ('Alan Turing', 'architect', NULL, '1936-06-15'),
          ('Grace Hopper', 'lead', NULL, '1952-03-01');
      `);
    }
  } catch (error) {
    throw new DatabaseError('Failed to initialize database', {
      message: error.message
    });
  } finally {
    client.release();
  }
}

async function pingDatabase() {
  try {
    await getPool().query('SELECT 1;');
    return 'up';
  } catch (error) {
    throw new DatabaseError('Database health check failed', {
      message: error.message
    });
  }
}

async function closePool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}

module.exports = {
  getPool,
  query,
  initializeDatabase,
  pingDatabase,
  closePool
};
