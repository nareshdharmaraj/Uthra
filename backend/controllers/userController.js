const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -pin');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      location: req.body.location
    };

    // Update role-specific fields
    if (req.user.role === 'farmer' && req.body.farmerDetails) {
      fieldsToUpdate.farmerDetails = req.body.farmerDetails;
    } else if (req.user.role === 'buyer' && req.body.buyerDetails) {
      fieldsToUpdate.buyerDetails = req.body.buyerDetails;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select('-password -pin');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PIN (farmers only)
// @route   PUT /api/users/me/pin
// @access  Private (Farmer)
exports.updatePIN = async (req, res, next) => {
  try {
    const { currentPin, newPin } = req.body;

    const user = await User.findById(req.user.id);
    
    // Verify current PIN
    if (user.pin !== currentPin) {
      return res.status(401).json({
        success: false,
        message: 'Current PIN is incorrect'
      });
    }

    // Update PIN
    user.pin = newPin;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'PIN updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/users/me/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedRequest')
      .populate('relatedCrop')
      .populate('relatedUser', 'name mobile');

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/users/me/notification-preferences
// @access  Private
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const { notificationPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences },
      { new: true, runValidators: true }
    ).select('-password -pin');

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};
