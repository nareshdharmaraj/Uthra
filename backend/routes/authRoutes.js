const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number (only numbers)'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters and spaces'),
  body('role').isIn(['farmer', 'buyer', 'admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number (only numbers)')
];

const pinLoginValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid Indian mobile number (10 digits starting with 6-9)'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
];

// Routes
router.post('/register/initiate', authLimiter, registerValidation, validate, authController.initiateRegistration);
router.post('/register/step2', authController.completeRegistrationStep2);
router.post('/register/step3', authController.completeRegistrationStep3);
router.post('/register/step4', authController.completeRegistrationStep4);

// Test endpoint without database
router.post('/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint works', body: req.body });
});

// Restore actual login with controller
router.post('/login', (req, res, next) => {
  console.log('🚀 LOGIN ROUTE HIT!', req.body);
  next();
}, authController.login);
router.post('/login/pin', authLimiter, pinLoginValidation, validate, authController.loginWithPIN);

router.post('/verify-otp', authLimiter, authController.verifyOTP);
router.post('/resend-otp', authLimiter, authController.resendOTP);

router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
