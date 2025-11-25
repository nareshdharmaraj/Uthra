const express = require('express');
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  checkMobile
} = require('../controllers/forgotPasswordController');

// Rate limiting middleware for forgot password endpoints
const rateLimit = require('express-rate-limit');

// Rate limit for OTP requests - max 3 requests per 15 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limit for OTP verification - max 5 attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 verification attempts per windowMs
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// @route   POST /api/auth/check-mobile
// @desc    Check if mobile number exists
// @access  Public
router.post('/check-mobile', checkMobile);

// @route   POST /api/auth/forgot-password
// @desc    Request OTP for forgot password
// @access  Public
router.post('/forgot-password', otpRequestLimiter, requestOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
// @access  Public
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);

module.exports = router;