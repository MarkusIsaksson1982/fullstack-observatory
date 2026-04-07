const http = require('http');

const req = http.request(
  {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    timeout: 2000
  },
  (res) => process.exit(res.statusCode === 200 ? 0 : 1)
);
req.on('error', () => process.exit(1));
req.end();
