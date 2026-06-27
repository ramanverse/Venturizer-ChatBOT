const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'venturizer_secret_key_123';

// Hardcoded admin credentials
const ADMIN_USER = {
  email: 'admin@venturizer.co',
  password: 'adminpassword'
};

/**
 * Authentication Middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = {
  authenticateToken,
  ADMIN_USER,
  JWT_SECRET
};
