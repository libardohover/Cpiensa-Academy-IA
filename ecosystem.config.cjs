// PM2: mantiene CPIENSA+ activo en segundo plano. Uso: npm run build && pm2 start ecosystem.config.cjs
module.exports = {
  apps: [{ name: 'cpiensa-academy-ia', script: 'dist/server.cjs', env: { PORT: 3000, HOST: '0.0.0.0' }, max_memory_restart: '400M' }],
};
