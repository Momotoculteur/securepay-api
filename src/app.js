const express = require('express');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware de parsing JSON
app.use(express.json());

// ==============================================================================
// [AUDIT ANOMALY #3 - DAST / SÉCURITÉ DES EN-TÊTES HTTP] :
// L'application n'utilise pas le middleware 'helmet'.
// Les en-têtes cruciaux manquent : Content-Security-Policy, X-Frame-Options, HSTS.
// L'en-tête de fuite d'information 'X-Powered-By: Express' est laissé actif par défaut.
// Le scan dynamique OWASP ZAP (zap-baseline.py) DOIT lever des alertes sur ces manquements !
// ==============================================================================

// Route de Healthcheck (utilisée par Docker, Kubernetes et le pipeline CI)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    service: 'securepay-api',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Route d'information générale
app.get('/api/info', (req, res) => {
  return res.json({
    name: 'SecurePay Solutions Core API',
    version: '1.0.0',
    compliance: 'PSSI (In Progress)'
  });
});

// Montage des routes applicatives
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// Gestion 404
app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
