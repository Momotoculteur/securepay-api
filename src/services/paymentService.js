/**
 * SecurePay Solutions - Core Payment Business Logic
 */

const COMMISSION_RATE = 0.018; // 1.8%
const FIXED_FEE = 0.25; // 0.25 EUR per transaction

/**
 * Validates basic transaction parameters.
 * @param {Object} paymentData
 * @returns {Boolean}
 */
function validatePayment(paymentData) {
  if (!paymentData || typeof paymentData !== 'object') {
    return false;
  }

  const { amount, currency, recipientId } = paymentData;

  if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
    return false;
  }

  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    return false;
  }

  if (!recipientId || typeof recipientId !== 'string') {
    return false;
  }

  return true;
}

/**
 * Calculates processing fees according to FinTech business rules.
 * @param {Number} amount 
 * @returns {Number} Total fee rounded to 2 decimal places
 */
function calculateFee(amount) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount for fee calculation');
  }

  const variableFee = amount * COMMISSION_RATE;
  const totalFee = variableFee + FIXED_FEE;
  return Math.round(totalFee * 100) / 100;
}

/**
 * Processes payment logic and returns a transaction result.
 * @param {Object} paymentData 
 * @returns {Object} Processed transaction details
 */
function processPayment(paymentData) {
  if (!validatePayment(paymentData)) {
    throw new Error('Payment payload validation failed');
  }

  const fee = calculateFee(paymentData.amount);
  const netAmount = Math.round((paymentData.amount - fee) * 100) / 100;

  // [AUDIT ANOMALY - CWE-330]: Weak pseudo-random number generator for financial references
  // Should use crypto.randomUUID() or crypto.randomBytes()
  const reference = 'TX-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return {
    reference,
    status: 'COMPLETED',
    grossAmount: paymentData.amount,
    fee,
    netAmount,
    currency: paymentData.currency.toUpperCase(),
    recipientId: paymentData.recipientId,
    processedAt: new Date().toISOString()
  };
}

module.exports = {
  validatePayment,
  calculateFee,
  processPayment,
  COMMISSION_RATE,
  FIXED_FEE
};
