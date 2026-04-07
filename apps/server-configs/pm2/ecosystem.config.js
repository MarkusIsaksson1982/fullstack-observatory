// pm2/ecosystem.config.js
// Process manager config for production Node.js
// Layer 4 of The Full Stack Observatory
// https://markusisaksson1982.github.io/layers/servers/

module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./src/server.js",

      // Clustering
      exec_mode: "cluster",
      instances: "max",

      // File watching
      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],

      // Logging
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Memory and restarts
      max_memory_restart: "512M",
      exp_backoff_restart_delay: 100,

      // Environment
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
