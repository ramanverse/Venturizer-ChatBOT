const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateToken, ADMIN_USER, JWT_SECRET } = require('../middleware/auth');
const {
  getLeads,
  getLeadById,
  updateLead,
  getStats,
  exportLeadsCSV,
  getSimulatedEmails
} = require('../controllers/dashboardController');

// Admin Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ token });
  }

  res.status(401).json({ error: 'Invalid admin credentials.' });
});

// Protect all other routes with JWT middleware
router.get('/leads', authenticateToken, getLeads);
router.get('/leads/:id', authenticateToken, getLeadById);
router.patch('/leads/:id/status', authenticateToken, updateLead);
router.get('/stats', authenticateToken, getStats);
router.get('/export', authenticateToken, exportLeadsCSV);
router.get('/emails', authenticateToken, getSimulatedEmails);

module.exports = router;
