const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Fallback secret if env var is missing
const JWT_SECRET = process.env.JWT_SECRET || 'insecure-dev-fallback-secret-key-32-chars';

/**
 * POST /api/auth/login
 * Dummy login endpoint for testing authentication workflows
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Simplified authentication for demo purposes
  if (password === 'password123') {
    const payload = {
      username,
      role: username === 'admin' ? 'ADMIN' : 'USER',
      iss: 'securepay-api'
    };

    // [AUDIT ANOMALY - SCA]: jsonwebtoken 8.5.1 has known vulnerabilities (CVE-2022-23529, CVE-2022-23540)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      message: 'Authentication successful',
      token,
      expiresIn: 3600
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
