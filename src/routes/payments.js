const express = require('express');
const { processPayment, validatePayment } = require('../services/paymentService');

const router = express.Router();

// ==============================================================================
// [AUDIT ANOMALY #1 - LEAK DE SECRETS COMMITTÉ DANS LE CODE] :
// Cette clé API Stripe a été hardcodée en fallback par l'équipe de développement legacy.
// Gitleaks / Trufflehog DOIT bloquer tout commit ou MR contenant ce pattern !
// ==============================================================================
const STRIPE_FALLBACK_SECRET = "sk_test_51Mz000FakeKey98765432101234567890abcdef";
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || STRIPE_FALLBACK_SECRET;

/**
 * POST /api/payments/process
 * Traitement d'une transaction financière
 */
router.post('/process', (req, res) => {
  try {
    const { amount, currency, recipientId, description } = req.body;

    if (!validatePayment({ amount, currency, recipientId })) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid payment parameters. Required: positive numeric amount, 3-letter currency, recipientId.'
      });
    }

    const transaction = processPayment({ amount, currency, recipientId });
    transaction.description = description || 'Standard Payment';
    transaction.gateway = STRIPE_KEY.startsWith('sk_') ? 'Stripe Gateway' : 'Mock Gateway';

    return res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Processing Error',
      message: error.message
    });
  }
});

/**
 * POST /api/payments/calculate-tax
 * [AUDIT ANOMALY #2 - SAST / VULNÉRABILITÉ CWE-95 CODE INJECTION] :
 * Cette route utilise la fonction eval() sur une chaîne fournie par l'utilisateur !
 * SonarQube et Semgrep DOIVENT détecter cette faille critique et bloquer la Quality Gate.
 */
router.post('/calculate-tax', (req, res) => {
  const { amount, formula } = req.body;

  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'amount is required' });
  }

  // Faille de sécurité volontaire pour SonarQube SAST (CWE-95 / Code Injection)
  try {
    const customFormula = formula || 'amount * 0.20';
    // eslint-disable-next-line no-eval
    const computedTax = eval(customFormula);

    return res.json({
      amount,
      tax: computedTax,
      totalWithTax: amount + computedTax
    });
  } catch (err) {
    return res.status(400).json({ error: 'Calculation failed', details: err.message });
  }
});

/**
 * GET /api/payments/recent
 * Récupère les transactions récentes (simulation)
 */
router.get('/recent', (req, res) => {
  return res.json({
    count: 2,
    transactions: [
      {
        reference: 'TX-20261018-001',
        amount: 149.99,
        currency: 'EUR',
        status: 'COMPLETED',
        recipientId: 'merchant_123'
      },
      {
        reference: 'TX-20261018-002',
        amount: 35.00,
        currency: 'EUR',
        status: 'COMPLETED',
        recipientId: 'merchant_456'
      }
    ]
  });
});

module.exports = router;
