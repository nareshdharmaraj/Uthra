// Lazy-load User model to ensure mongoose connection is established first
const getUserModel = () => require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Initiate registration (Step 1 - Basic Info)
// @route   POST /api/auth/register/initiate
// @access  Public
exports.initiateRegistration = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { mobile, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number already registered'
      });
    }

    // Create user with basic info (Stage 0)
    const user = await User.create({
      mobile,
      name,
      role,
      registrationStage: 0
    });

    // Generate OTP (mock implementation - integrate with actual SMS service)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // TODO: Send OTP via SMS
    console.log(`OTP for ${mobile}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please verify OTP.',
      data: {
        userId: user._id,
        mobile: user.mobile,
        registrationStage: 0,
        // In development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { otp })
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete registration Step 2 (Location details)
// @route   POST /api/auth/register/step2
// @access  Public
exports.completeRegistrationStep2 = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { userId, location } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.registrationStage !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration stage'
      });
    }

    // Update location
    user.location = location;
    user.registrationStage = 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location details saved',
      data: {
        userId: user._id,
        registrationStage: 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete registration Step 3 (Role-specific details)
// @route   POST /api/auth/register/step3
// @access  Public
exports.completeRegistrationStep3 = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { userId, farmerDetails, buyerDetails, password, pin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.registrationStage !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration stage'
      });
    }

    // Update role-specific details
    if (user.role === 'farmer') {
      // Validate PIN for farmers
      if (!pin || !/^[0-9]{4,6}$/.test(pin)) {
        return res.status(400).json({
          success: false,
          message: 'PIN must be 4-6 digits'
        });
      }

      user.farmerDetails = farmerDetails;
      user.pin = pin; // Store PIN as plain text for IVR access
      
      // Password is optional for farmers (they primarily use PIN for IVR)
      if (password) {
        user.password = password; // Store password as plain text
      }
    } else if (user.role === 'buyer') {
      // Validate password for buyers
      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      
      user.buyerDetails = buyerDetails;
      user.password = password; // Store password as plain text
    } else if (user.role === 'admin') {
      // Validate password for admins
      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      
      user.password = password; // Store password as plain text
    }

    user.registrationStage = 2;
    await user.save();

    console.log(`✅ Step 3 completed for ${user.role}: ${user.name}`);

    res.status(200).json({
      success: true,
      message: 'Details saved successfully',
      data: {
        userId: user._id,
        registrationStage: 2
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete registration Step 4 (Verification & Completion)
// @route   POST /api/auth/register/step4
// @access  Public
exports.completeRegistrationStep4 = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { userId, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.registrationStage !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration stage'
      });
    }

    // Update final details
    if (email) user.email = email;
    user.registrationStage = 4;
    user.registrationCompleted = true;
    user.isVerified = true; // Auto-verify for now
    user.isActive = true; // Activate user account
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ Registration completed for ${user.role}: ${user.name} (${user.mobile})`);
    if (user.role === 'farmer') {
      console.log(`   PIN set: ${user.pin ? 'Yes' : 'No'}`);
      console.log(`   Farmer can now login via IVR using mobile: ${user.mobile} and PIN`);
    }

    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          email: user.email,
          location: user.location,
          registrationCompleted: user.registrationCompleted
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Web - Buyer/Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const User = getUserModel(); // Lazy-load the model
    const mongoose = require('mongoose');
    console.log('🔐 Login attempt:', { mobile: req.body.mobile });
    console.log('🔍 Mongoose connection state:', mongoose.connection.readyState);
    console.log('🔍 User model connection state:', User.db?.readyState);
    
    const { mobile, password } = req.body;

    // Find user
    console.log('📞 Searching for user with mobile:', mobile);
    const user = await User.findOne({ mobile }).maxTimeMS(5000);
    console.log('✅ User query completed:', user ? `Found ${user.name}` : 'Not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if registration is complete
    if (!user.registrationCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete registration first',
        registrationStage: user.registrationStage,
        userId: user._id
      });
    }

    // Check password (plain text comparison)
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          location: user.location
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with PIN (IVR - Farmers)
// @route   POST /api/auth/login/pin
// @access  Public
exports.loginWithPIN = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { mobile, pin } = req.body;

    console.log(`📞 IVR Login attempt - Mobile: ${mobile}`);

    // Find farmer
    const user = await User.findOne({ mobile, role: 'farmer' });
    if (!user) {
      console.log(`❌ IVR Login failed - Mobile not found: ${mobile}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please enter a valid mobile number.'
      });
    }

    // Check if registration is complete
    if (!user.registrationCompleted) {
      console.log(`⚠️ IVR Login blocked - Registration incomplete: ${mobile}`);
      return res.status(400).json({
        success: false,
        message: 'Please complete your registration via web dashboard first'
      });
    }

    // Check if PIN is set
    if (!user.pin) {
      console.log(`⚠️ IVR Login blocked - PIN not set: ${mobile}`);
      return res.status(400).json({
        success: false,
        message: 'PIN not set. Please set your PIN via web dashboard'
      });
    }

    // Check PIN
    if (user.pin !== pin) {
      console.log(`❌ IVR Login failed - Invalid PIN for: ${mobile}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN. Please try again.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`⚠️ IVR Login blocked - Account inactive: ${mobile}`);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }

    // Update IVR stats
    user.lastIVRCall = new Date();
    user.totalIVRCalls = (user.totalIVRCalls || 0) + 1;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ IVR Login successful - ${user.name} (${mobile}), Total IVR calls: ${user.totalIVRCalls}`);

    // Return greeting message as per README
    res.status(200).json({
      success: true,
      message: `Vanakkam, ${user.name}! Welcome to Uthra.`,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          farmerDetails: user.farmerDetails,
          preferredLanguage: user.farmerDetails?.preferredLanguage || 'tamil'
        },
        greeting: {
          tamil: `வணக்கம், ${user.name}! உத்ராவிற்கு வரவேற்கிறோம்.`,
          english: `Welcome, ${user.name}! Welcome to Uthra.`,
          hindi: `नमस्ते, ${user.name}! उथरा में आपका स्वागत है।`
        }
      }
    });
  } catch (error) {
    console.error('❌ IVR Login error:', error);
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    // TODO: Implement actual OTP verification
    // For now, accept any 4-digit OTP in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // TODO: Send OTP via SMS
    console.log(`New OTP for ${mobile}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // In development only
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send reset link via SMS
    console.log(`Reset token for ${mobile}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent',
      // In development only
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const User = getUserModel();
    const { resetToken, newPassword } = req.body;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (Date.now() > user.resetPasswordExpire) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
