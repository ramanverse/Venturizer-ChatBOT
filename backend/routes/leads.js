const express = require('express');
const router = express.Router();
const { startLead, saveAnswer, submitLead } = require('../controllers/leadController');

router.post('/start', startLead);
router.post('/answer', saveAnswer);
router.post('/submit', submitLead);

module.exports = router;
