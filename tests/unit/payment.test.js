const {
  validatePayment,
  calculateFee,
  processPayment,
  COMMISSION_RATE,
  FIXED_FEE
} = require('../../src/services/paymentService');

describe('PaymentService - Unit Tests', () => {
  describe('validatePayment()', () => {
    it('should validate a correct payment payload', () => {
      const validPayload = {
        amount: 100.0,
        currency: 'EUR',
        recipientId: 'merchant_99'
      };
      expect(validatePayment(validPayload)).toBe(true);
    });

    it('should reject a negative or zero amount', () => {
      expect(validatePayment({ amount: -5, currency: 'EUR', recipientId: 'm_1' })).toBe(false);
      expect(validatePayment({ amount: 0, currency: 'EUR', recipientId: 'm_1' })).toBe(false);
    });

    it('should reject an invalid currency format', () => {
      expect(validatePayment({ amount: 50, currency: 'EUROPE', recipientId: 'm_1' })).toBe(false);
      expect(validatePayment({ amount: 50, currency: '', recipientId: 'm_1' })).toBe(false);
    });

    it('should reject missing recipientId', () => {
      expect(validatePayment({ amount: 50, currency: 'EUR' })).toBe(false);
    });
  });

  describe('calculateFee()', () => {
    it('should calculate the fee correctly for 100 EUR', () => {
      // 100 * 0.018 + 0.25 = 1.80 + 0.25 = 2.05 EUR
      const fee = calculateFee(100);
      expect(fee).toBe(2.05);
    });

    it('should throw an error for non-numeric or negative amounts', () => {
      expect(() => calculateFee(-10)).toThrow('Invalid amount for fee calculation');
      expect(() => calculateFee('100')).toThrow('Invalid amount for fee calculation');
    });
  });

  describe('processPayment()', () => {
    it('should successfully process a payment and return full transaction details', () => {
      const payload = {
        amount: 250.0,
        currency: 'usd',
        recipientId: 'acct_partner_77'
      };

      const result = processPayment(payload);

      expect(result).toHaveProperty('reference');
      expect(result.reference.startsWith('TX-')).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.grossAmount).toBe(250.0);
      expect(result.fee).toBe(4.75); // 250 * 0.018 + 0.25 = 4.5 + 0.25 = 4.75
      expect(result.netAmount).toBe(245.25);
      expect(result.currency).toBe('USD');
      expect(result.recipientId).toBe('acct_partner_77');
      expect(result).toHaveProperty('processedAt');
    });

    it('should throw an error if the payment payload is invalid', () => {
      expect(() => processPayment({})).toThrow('Payment payload validation failed');
    });
  });
});
