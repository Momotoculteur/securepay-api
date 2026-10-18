const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[SecurePay API] Service listening on http://0.0.0.0:${PORT}`);
  console.log(`[SecurePay API] Healthcheck available at http://0.0.0.0:${PORT}/health`);
});
