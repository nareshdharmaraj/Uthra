const OTPService = require('../services/otpService');
const EmailService = require('../services/emailService');
const UserService = require('../services/userService');

// @desc    Request OTP for forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.requestOTP = async (req, res, next) => {
  try {
    const { mobile, emailJSPublicKey } = req.body;

    // Validate input
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number'
      });
    }

    if (!emailJSPublicKey) {
      return res.status(400).json({
        success: false,
        message: 'EmailJS configuration missing'
      });
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    console.log(`🔍 Forgot password request for mobile: ${mobile}`);

    // Find user across all collections
    const user = await UserService.findUserByMobile(mobile);
    
    if (!user) {
      console.log(`❌ Mobile number ${mobile} not found in database`);
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
    }

    // Check if user has an email
    if (!user.email || user.email.trim() === '') {
      console.log(`❌ User ${user.name} (${mobile}) has no email registered`);
      return res.status(400).json({
        success: false,
        message: 'You did not register an email ID with this phone number'
      });
    }

    // Generate OTP and expiry
    const otp = OTPService.generateOTP();
    const otpExpiry = OTPService.generateOTPExpiry();

    console.log(`🔐 Generated OTP for ${user.name} (${user.role}): ${otp}`);
    console.log(`⏰ OTP expires at: ${OTPService.formatExpiryTime(otpExpiry)}`);

    // Store OTP in database
    const otpStored = await UserService.updateUserOTP(user._id, user.role, otp, otpExpiry);
    
    if (!otpStored) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      });
    }

    // Send OTP via email
    const emailResult = await EmailService.sendOTPEmail(
      user.email,
      otp,
      user.name,
      otpExpiry,
      emailJSPublicKey
    );

    // If emailResult is falsy or indicates failure, clear stored OTP and return an informative error
    if (!emailResult || emailResult.success === false) {
      // Clear the OTP if email failed
      await UserService.clearUserOTP(user._id, user.role);

      // Handle EmailJS-specific errors
      if (emailResult && emailResult.status === 404) {
        console.error('EmailJS 404 returned while sending OTP:', emailResult.data);
        return res.status(502).json({
          success: false,
          message: 'EmailJS account/template not found. Please verify service ID, template ID and public key.'
        });
      }

      // Generic Email sending failure
      const errMessage = (emailResult && emailResult.message) ? emailResult.message : 'Failed to send OTP email. Please try again.';
      return res.status(500).json({
        success: false,
        message: errMessage
      });
    }

    console.log(`✅ OTP sent successfully to ${user.email}`);

    // Return success response (don't include sensitive data)
    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
      data: {
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        expiresAt: OTPService.formatExpiryTime(otpExpiry),
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error in requestOTP:', error);
    next(error);
  }
};

// @desc    Verify OTP and login user
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and OTP'
      });
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Validate OTP format
    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP'
      });
    }

    console.log(`🔐 OTP verification attempt for mobile: ${mobile}`);

    // Verify OTP
    const user = await UserService.verifyUserOTP(mobile, otp);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    console.log(`✅ OTP verified successfully for ${user.name} (${user.role})`);

    // Generate JWT token (same as regular login)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Set cookie options
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    // Prepare user data for response (exclude sensitive fields)
    const userData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      location: user.location,
      isVerified: user.isVerified,
      isActive: user.isActive,
      registrationStage: user.registrationStage,
      registrationCompleted: user.registrationCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific fields
    if (user.role === 'buyer' && user.buyerType) {
      userData.buyerType = user.buyerType;
    }

    console.log(`📤 Sending user response for OTP login: ${user.name} (${user.role})`);

    // Send response with cookie
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        message: 'Login successful via OTP',
        token,
        data: userData
      });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    next(error);
  }
};

// @desc    Check if mobile number exists (for forgot password flow)
// @route   POST /api/auth/check-mobile
// @access  Public
exports.checkMobile = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    // Validate input
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number'
      });
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    console.log(`🔍 Checking mobile number: ${mobile}`);

    // Find user across all collections
    const user = await UserService.findUserByMobile(mobile);
    
    if (!user) {
      console.log(`❌ Mobile number ${mobile} not found in database`);
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
    }

    // Check if user has an email
    if (!user.email || user.email.trim() === '') {
      console.log(`❌ User ${user.name} (${mobile}) has no email registered`);
      return res.status(400).json({
        success: false,
        message: 'You did not register an email ID with this phone number'
      });
    }

    console.log(`✅ Mobile ${mobile} found - User: ${user.name}, Email: ${user.email}, Role: ${user.role}`);

    res.status(200).json({
      success: true,
      message: 'Mobile number and email verified successfully',
      data: {
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error in checkMobile:', error);
    next(error);
  }
};