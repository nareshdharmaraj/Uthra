const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/BuyerModel');
const Admin = require('../models/AdminModel');

// Helper to find user by ID across all collections
const findUserById = async (userId) => {
  let user = await Farmer.findById(userId).select('-password -pin');
  if (user) return user;
  
  user = await Buyer.findById(userId).select('-password -pin');
  if (user) return user;
  
  user = await Admin.findById(userId).select('-password -pin');
  return user;
};

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token - search across all role-specific collections
      req.user = await findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Verify PIN for IVR access (farmers)
exports.verifyPIN = async (req, res, next) => {
  try {
    const { mobile, pin } = req.body;

    if (!mobile || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and PIN'
      });
    }

    // Find user by mobile
    const user = await User.findOne({ mobile, role: 'farmer' });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check PIN
    if (user.pin !== pin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Update last IVR call time
    user.lastIVRCall = new Date();
    user.totalIVRCalls += 1;
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
