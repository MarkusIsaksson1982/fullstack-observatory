const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// ── PostgreSQL ──
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://user:password@db:5432/fullstack'
});

// ── Redis ──
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://cache:6379'
});
redis.on('error', (err) => console.error('Redis error:', err.message));

// ── Routes ──
app.get('/', async (req, res) => {
  const status = { postgres: 'disconnected', redis: 'disconnected' };

  try {
    const dbRes = await pool.query('SELECT NOW() AS time');
    status.postgres = `connected (${dbRes.rows[0].time})`;
  } catch (err) {
    status.postgres = `error: ${err.message}`;
  }

  try {
    await redis.set('observatory:ping', 'pong');
    const pong = await redis.get('observatory:ping');
    status.redis = pong === 'pong' ? 'connected' : 'unexpected response';
  } catch (err) {
    status.redis = `error: ${err.message}`;
  }

  res.json({
    service: 'fullstack-containerized',
    layer: 9,
    observatory: 'https://markusisaksson1982.github.io/layers/containers/',
    services: status
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});

// ── Startup ──
async function start() {
  try {
    await redis.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('Redis connection failed:', err.message);
  }

  app.listen(port, () => {
    console.log(`fullstack-containerized listening on port ${port}`);
  });
}

start();
