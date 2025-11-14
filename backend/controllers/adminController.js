const User = require('../models/User');
const Crop = require('../models/Crop');
const Request = require('../models/Request');
const CallLog = require('../models/CallLog');
const SMSLog = require('../models/SMSLog');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password -pin')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password -pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private (Admin)
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password -pin');

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin)
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -pin');

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all crops
// @route   GET /api/admin/crops
// @access  Private (Admin)
exports.getAllCrops = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmer', 'name mobile');

    const count = await Crop.countDocuments(query);

    res.status(200).json({
      success: true,
      count: crops.length,
      total: count,
      data: crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop details
// @route   GET /api/admin/crops/:id
// @access  Private (Admin)
exports.getCropDetails = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name mobile location');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify crop
// @route   PUT /api/admin/crops/:id/verify
// @access  Private (Admin)
exports.verifyCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: true, 
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Crop verified successfully',
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop
// @route   DELETE /api/admin/crops/:id
// @access  Private (Admin)
exports.deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('buyer', 'name mobile')
      .populate('farmer', 'name mobile')
      .populate('crop', 'name');

    const count = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total: count,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request details
// @route   GET /api/admin/requests/:id
// @access  Private (Admin)
exports.getRequestDetails = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('buyer')
      .populate('farmer')
      .populate('crop');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics overview
// @route   GET /api/admin/analytics/overview
// @access  Private (Admin)
exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalCrops = await Crop.countDocuments();
    const activeCrops = await Crop.countDocuments({ status: 'active' });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers },
        crops: { total: totalCrops, active: activeCrops },
        requests: { total: totalRequests, pending: pendingRequests, completed: completedRequests }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Placeholder methods
exports.getCropAnalytics = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Crop analytics coming soon' });
};

exports.getUserAnalytics = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'User analytics coming soon' });
};

exports.getTransactionAnalytics = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Transaction analytics coming soon' });
};

exports.getCallLogs = async (req, res, next) => {
  try {
    const callLogs = await CallLog.find()
      .sort({ startTime: -1 })
      .limit(50)
      .populate('farmer', 'name mobile');

    res.status(200).json({
      success: true,
      count: callLogs.length,
      data: callLogs
    });
  } catch (error) {
    next(error);
  }
};

exports.getCallLogDetails = async (req, res, next) => {
  try {
    const callLog = await CallLog.findById(req.params.id)
      .populate('farmer')
      .populate('relatedRequest')
      .populate('relatedCrop');

    res.status(200).json({
      success: true,
      data: callLog
    });
  } catch (error) {
    next(error);
  }
};

exports.getSMSLogs = async (req, res, next) => {
  try {
    const smsLogs = await SMSLog.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: smsLogs.length,
      data: smsLogs
    });
  } catch (error) {
    next(error);
  }
};

exports.sendBroadcastNotification = async (req, res, next) => {
  try {
    const { title, message, role, userIds } = req.body;

    // TODO: Implement broadcast notification logic

    res.status(200).json({
      success: true,
      message: 'Broadcast notification sent'
    });
  } catch (error) {
    next(error);
  }
};
