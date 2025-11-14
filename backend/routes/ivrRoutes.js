const express = require('express');
const router = express.Router();
const { ivrLimiter } = require('../middleware/rateLimiter');
const ivrController = require('../controllers/ivrController');

// IVR endpoints (called by Twilio/Exotel)
router.post('/incoming-call', ivrLimiter, ivrController.handleIncomingCall);
router.post('/verify-pin', ivrLimiter, ivrController.verifyPIN);
router.post('/main-menu', ivrLimiter, ivrController.mainMenu);
router.post('/add-crop', ivrLimiter, ivrController.addCrop);
router.post('/manage-crops', ivrLimiter, ivrController.manageCrops);
router.post('/view-requests', ivrLimiter, ivrController.viewRequests);
router.post('/handle-request', ivrLimiter, ivrController.handleRequest);
router.post('/gather-input', ivrLimiter, ivrController.gatherInput);
router.post('/connect-agent', ivrLimiter, ivrController.connectToAgent);

// Call status callbacks
router.post('/call-status', ivrController.callStatusCallback);

// Voice recognition webhook
router.post('/voice-input', ivrController.handleVoiceInput);

module.exports = router;
