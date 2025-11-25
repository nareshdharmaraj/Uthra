// Temporary test version of forgot password controller with EmailJS bypass
// This is for testing purposes only

const express = require('express');
const router = express.Router();
const UserService = require('./backend/services/userService');
const OTPService = require('./backend/services/otpService');

// Test endpoint that bypasses EmailJS
router.post('/test-forgot-password', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    console.log(`🔍 Test forgot password request for mobile: ${mobile}`);

    // Find user across all collections
    const user = await UserService.findUserByMobile(mobile);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this mobile number'
      });
    }

    // Check if user has an email
    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'No email address found for this account. Please contact support.'
      });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    const otpExpiry = OTPService.getOTPExpiry();

    console.log(`🔐 Generated OTP for ${user.name} (${user.role}): ${otp}`);
    console.log(`⏰ OTP expires at: ${otpExpiry.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

    // Store OTP in database
    await UserService.storeUserOTP(user._id, user.role, otp, otpExpiry);

    // BYPASS EMAIL SENDING - Just log the OTP for testing
    console.log(`📧 [TEST MODE] OTP for ${user.email}: ${otp}`);
    console.log(`⏰ [TEST MODE] Valid until: ${otpExpiry.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

    // Return success response with test data
    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully (test mode)',
      data: {
        email: user.email.substring(0, 3) + '***@' + user.email.split('@')[1],
        role: user.role,
        expiresAt: otpExpiry.toISOString(),
        testOTP: otp // Include OTP for testing - REMOVE IN PRODUCTION!
      }
    });

  } catch (error) {
    console.error('❌ Test forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Test OTP verification endpoint  
router.post('/test-verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile) || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number or OTP format'
      });
    }

    console.log(`🔐 Test OTP verification for mobile: ${mobile}, OTP: ${otp}`);

    // Find user across all collections
    const user = await UserService.findUserByMobile(mobile);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this mobile number'
      });
    }

    // Verify OTP
    const isValidOTP = await UserService.verifyUserOTP(user._id, user.role, otp);
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP after successful verification
    await UserService.clearUserOTP(user._id, user.role);

    // Generate JWT token (using existing auth logic)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user._id, 
        mobile: user.mobile, 
        role: user.role,
        buyerType: user.buyerType 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log(`✅ Test OTP verified successfully for ${user.name}`);

    // Return user data and token
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          role: user.role,
          buyerType: user.buyerType
        }
      }
    });

  } catch (error) {
    console.error('❌ Test OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

module.exports = router;