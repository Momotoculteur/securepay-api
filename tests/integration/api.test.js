const request = require('supertest');
const app = require('../../src/app');

describe('SecurePay API - Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK with UP status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('service', 'securepay-api');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'developer', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'developer', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/payments/process', () => {
    it('should create a payment and return 201 Created', async () => {
      const paymentPayload = {
        amount: 80.0,
        currency: 'EUR',
        recipientId: 'merchant_paris_01',
        description: 'Order #90210'
      };

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.netAmount).toBeLessThan(80.0);
      expect(response.body.data.currency).toBe('EUR');
    });

    it('should return 400 Bad Request if amount is missing or negative', async () => {
      const response = await request(app)
        .post('/api/payments/process')
        .send({ amount: -50, currency: 'EUR', recipientId: 'merchant_1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });
});
