module.exports = {
  apps: [
    {
      name: 'sharp-server',
      script: 'server/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '256M'
    }
  ]
}; 