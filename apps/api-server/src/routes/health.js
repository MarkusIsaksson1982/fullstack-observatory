const express = require('express');

const { pingDatabase } = require('../db/pool');

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createHealthRouter(options = {}) {
  const getDatabaseStatus = options.getDatabaseStatus || pingDatabase;
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const database = await getDatabaseStatus();

      res.json({
        status: 'ok',
        uptime: `${Math.round(process.uptime())}s`,
        framework: 'Express.js',
        environment: process.env.NODE_ENV || 'development',
        database,
        service: 'fullstack-api-server'
      });
    })
  );

  return router;
}

module.exports = createHealthRouter;
