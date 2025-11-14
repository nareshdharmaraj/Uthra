const express = require('express');
const router = express.Router();
const { smsLimiter } = require('../middleware/rateLimiter');
const smsController = require('../controllers/smsController');

// SMS webhook (incoming SMS from Twilio/Gupshup)
router.post('/incoming', smsLimiter, smsController.handleIncomingSMS);

// Send SMS (internal API)
router.post('/send', smsController.sendSMS);

// SMS status callback
router.post('/status', smsController.smsStatusCallback);

module.exports = router;
