const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/BuyerModel');
const Admin = require('../models/AdminModel');
const Crop = require('../models/Crop');
const Request = require('../models/Request');
const CallLog = require('../models/CallLog');
const SMSLog = require('../models/SMSLog');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');

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

    // Get role-specific details
    let roleDetails = null;
    if (user.role === 'farmer') {
      roleDetails = await Farmer.findOne({ user: user._id })
        .select('farmSize crops landDetails experienceYears preferredLanguage bankDetails documents')
        .lean();
    } else if (user.role === 'buyer') {
      roleDetails = await Buyer.findOne({ user: user._id })
        .select('buyerType companyName businessRegistration interestedCrops purchaseHistory preferredQuantities')
        .lean();
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        roleDetails
      }
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

// @desc    Change user password
// @route   PUT /api/admin/users/:id/change-password
// @access  Private (Admin)
exports.changeUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
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
    // Count from actual models, not User model with role filter
    const totalFarmers = await Farmer.countDocuments();
    const totalBuyers = await Buyer.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalUsers = totalFarmers + totalBuyers + totalAdmins;
    
    const totalCrops = await Crop.countDocuments();
    const activeCrops = await Crop.countDocuments({ status: 'active' });
    const soldOutCrops = await Crop.countDocuments({ status: 'sold_out' });
    
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const confirmedRequests = await Request.countDocuments({ status: 'confirmed' });

    res.status(200).json({
      success: true,
      data: {
        users: { 
          total: totalUsers, 
          farmers: totalFarmers, 
          buyers: totalBuyers,
          admins: totalAdmins 
        },
        crops: { 
          total: totalCrops, 
          active: activeCrops,
          soldOut: soldOutCrops 
        },
        requests: { 
          total: totalRequests, 
          pending: pendingRequests, 
          completed: completedRequests,
          confirmed: confirmedRequests 
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop analytics
// @route   GET /api/admin/analytics/crops
// @access  Private (Admin)
exports.getCropAnalytics = async (req, res, next) => {
  try {
    const totalCrops = await Crop.countDocuments();
    const activeCrops = await Crop.countDocuments({ status: 'active' });
    const soldOutCrops = await Crop.countDocuments({ status: 'sold_out' });
    const removedCrops = await Crop.countDocuments({ isVisible: false });

    // Crops by category
    const cropsByCategory = await Crop.aggregate([
      { $match: { isVisible: { $ne: false } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ['$quantity.value', '$quantity'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top farmers by crops
    const topFarmers = await Crop.aggregate([
      { $match: { isVisible: { $ne: false } } },
      {
        $group: {
          _id: '$farmer',
          cropCount: { $sum: 1 }
        }
      },
      { $sort: { cropCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      { $unwind: '$farmer' }
    ]);

    // Price trends
    const priceTrends = await Crop.aggregate([
      { $match: { isVisible: { $ne: false } } },
      {
        $group: {
          _id: '$category',
          minPrice: { $min: { $ifNull: ['$price.value', '$price'] } },
          maxPrice: { $max: { $ifNull: ['$price.value', '$price'] } },
          avgPrice: { $avg: { $ifNull: ['$price.value', '$price'] } }
        }
      }
    ]);

    // Recent crop additions
    const recentCrops = await Crop.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('farmer', 'name mobile')
      .select('name category price quantity status createdAt');

    res.status(200).json({
      success: true,
      data: {
        total: totalCrops,
        active: activeCrops,
        soldOut: soldOutCrops,
        removed: removedCrops,
        cropsByCategory,
        topFarmers,
        priceAnalysis: priceTrends,
        recentCrops
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private (Admin)
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const totalBuyers = await Buyer.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    
    const activeFarmers = await Farmer.countDocuments({ isActive: true });
    const activeBuyers = await Buyer.countDocuments({ isActive: true });
    
    const verifiedFarmers = await Farmer.countDocuments({ isVerified: true });
    const verifiedBuyers = await Buyer.countDocuments({ isVerified: true });

    // User registrations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const farmerRegistrations = await Farmer.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const buyerRegistrations = await Buyer.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Buyer types distribution
    const buyerTypes = await Buyer.aggregate([
      {
        $group: {
          _id: '$buyerType',
          count: { $sum: 1 }
        }
      }
    ]);

    // User locations (top districts) - Combine farmers and buyers
    const farmerDistricts = await Farmer.aggregate([
      { $match: { 'location.district': { $exists: true, $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$location.district',
          count: { $sum: 1 }
        }
      }
    ]);

    const buyerDistricts = await Buyer.aggregate([
      { $match: { 'location.district': { $exists: true, $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$location.district',
          count: { $sum: 1 }
        }
      }
    ]);

    // Merge and sum districts from both collections
    const districtMap = new Map();
    [...farmerDistricts, ...buyerDistricts].forEach(item => {
      const district = item._id;
      districtMap.set(district, (districtMap.get(district) || 0) + item.count);
    });

    const topDistricts = Array.from(districtMap, ([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Most active users (by requests/crops)
    const mostActiveUsers = await Request.aggregate([
      {
        $group: {
          _id: '$buyer',
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { requestCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'buyers',
          localField: '_id',
          foreignField: '_id',
          as: 'buyerInfo'
        }
      },
      { $unwind: '$buyerInfo' }
    ]);

    // Merge registration trends
    const dateMap = new Map();
    farmerRegistrations.forEach(item => {
      dateMap.set(item._id, { date: item._id, farmers: item.count, buyers: 0 });
    });
    buyerRegistrations.forEach(item => {
      if (dateMap.has(item._id)) {
        dateMap.get(item._id).buyers = item.count;
      } else {
        dateMap.set(item._id, { date: item._id, farmers: 0, buyers: item.count });
      }
    });
    
    const registrationTrend = Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        totalFarmers,
        totalBuyers,
        totalAdmins,
        activeFarmers,
        activeBuyers,
        verifiedFarmers,
        verifiedBuyers,
        registrationTrend,
        buyerTypes,
        topDistricts,
        activeUsers: mostActiveUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction analytics
// @route   GET /api/admin/analytics/transactions
// @access  Private (Admin)
exports.getTransactionAnalytics = async (req, res, next) => {
  try {
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const confirmedRequests = await Request.countDocuments({ status: 'confirmed' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const cancelledRequests = await Request.countDocuments({ status: 'cancelled' });
    const rejectedRequests = await Request.countDocuments({ status: 'farmer_rejected' });

    // Request status distribution
    const statusDistribution = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Transactions over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionTrends = await Request.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$requestedQuantity.value', '$offeredPrice.value'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total transaction value (completed requests)
    const transactionValue = await Request.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalValue: { 
            $sum: { 
              $multiply: [
                { $ifNull: ['$finalAgreement.quantity.value', '$requestedQuantity.value'] },
                { $ifNull: ['$finalAgreement.price.value', '$offeredPrice.value'] }
              ]
            }
          },
          totalQuantity: { $sum: { $ifNull: ['$finalAgreement.quantity.value', '$requestedQuantity.value'] } }
        }
      }
    ]);

    // Average transaction time (pending to completed)
    const avgTransactionTime = await Request.aggregate([
      { $match: { status: 'completed', completedAt: { $exists: true } } },
      {
        $project: {
          duration: { $subtract: ['$completedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Top requested crops
    const topRequestedCrops = await Request.aggregate([
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$cropInfo.name',
          count: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ['$requestedQuantity.value', '$requestedQuantity'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Counter offer statistics
    const counterOfferStats = await Request.aggregate([
      {
        $group: {
          _id: null,
          totalWithCounterOffer: {
            $sum: { $cond: [{ $ne: ['$counterOffer', null] }, 1, 0] }
          },
          acceptedCounterOffers: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ]);

    const counterOfferData = counterOfferStats[0] || { totalWithCounterOffer: 0, acceptedCounterOffers: 0 };
    
    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        pending: pendingRequests,
        confirmed: confirmedRequests,
        completed: completedRequests,
        cancelled: cancelledRequests,
        rejected: rejectedRequests,
        transactionTrend: transactionTrends,
        totalTransactionValue: transactionValue[0]?.totalValue || 0,
        avgCompletionTime: avgTransactionTime[0] ? Math.round(avgTransactionTime[0].avgDuration / (1000 * 60 * 60 * 24)) : 0,
        topCrops: topRequestedCrops,
        counterOfferStats: {
          total: counterOfferData.totalWithCounterOffer,
          accepted: counterOfferData.acceptedCounterOffers,
          acceptanceRate: counterOfferData.totalWithCounterOffer > 0 
            ? (counterOfferData.acceptedCounterOffers / counterOfferData.totalWithCounterOffer * 100) 
            : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
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

    let recipients = [];
    
    if (userIds && userIds.length > 0) {
      recipients = userIds;
    } else if (role) {
      if (role === 'farmer') {
        const farmers = await Farmer.find({ isActive: true }).select('_id');
        recipients = farmers.map(f => f._id);
      } else if (role === 'buyer') {
        const buyers = await Buyer.find({ isActive: true }).select('_id');
        recipients = buyers.map(b => b._id);
      }
    }

    // Create notifications for all recipients
    const notifications = recipients.map(userId => ({
      user: userId,
      title,
      message,
      type: 'broadcast',
      createdBy: req.user.id
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Broadcast notification sent to ${recipients.length} users`,
      count: recipients.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name mobile role')
      .populate('createdBy', 'name');

    const count = await Notification.countDocuments();

    res.status(200).json({
      success: true,
      count: notifications.length,
      total: count,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics/dashboard
// @access  Private (Admin)
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get counts
    const totalFarmers = await Farmer.countDocuments();
    const totalBuyers = await Buyer.countDocuments();
    const totalCrops = await Crop.countDocuments({ isVisible: { $ne: false } });
    const activeCrops = await Crop.countDocuments({ status: 'active', isVisible: { $ne: false } });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    // Today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayFarmers = await Farmer.countDocuments({ createdAt: { $gte: today } });
    const todayBuyers = await Buyer.countDocuments({ createdAt: { $gte: today } });
    const todayCrops = await Crop.countDocuments({ createdAt: { $gte: today } });
    const todayRequests = await Request.countDocuments({ createdAt: { $gte: today } });

    // Recent activity
    const recentUsers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name mobile createdAt');

    const recentCrops = await Crop.find({ isVisible: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'name mobile')
      .select('name variety category price quantity availableQuantity location createdAt');

    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'name mobile buyerType')
      .populate('crop', 'name quantity')
      .select('status requestedQuantity buyerType createdAt');

    // Transaction value
    const completedValue = await Request.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$finalAgreement.quantity.value', '$requestedQuantity.value'] },
                { $ifNull: ['$finalAgreement.price.value', '$offeredPrice.value'] }
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalFarmers,
          totalBuyers,
          totalCrops,
          totalRequests,
          totalTransactionValue: completedValue[0]?.totalValue || 0
        },
        todayActivity: {
          newFarmers: todayFarmers,
          newBuyers: todayBuyers,
          newCrops: todayCrops,
          newRequests: todayRequests
        },
        recentActivity: {
          users: recentUsers,
          crops: recentCrops,
          requests: recentRequests
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Combine recent activities from different collections
    const recentCrops = await Crop.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('farmer', 'name mobile')
      .select('name action createdAt')
      .lean();

    const recentRequests = await Request.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('buyer', 'name')
      .populate('farmer', 'name')
      .populate('crop', 'name')
      .select('status updatedAt')
      .lean();

    const recentUsers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name role createdAt')
      .lean();

    // Combine and sort all activities
    const activities = [
      ...recentCrops.map(c => ({
        type: 'crop',
        action: 'created',
        description: `${c.farmer?.name} added crop: ${c.name}`,
        timestamp: c.createdAt,
        user: c.farmer
      })),
      ...recentRequests.map(r => ({
        type: 'request',
        action: r.status,
        description: `Request for ${r.crop?.name} - ${r.status}`,
        timestamp: r.updatedAt,
        buyer: r.buyer,
        farmer: r.farmer
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        action: 'registered',
        description: `${u.name} registered as ${u.role}`,
        timestamp: u.createdAt,
        user: u
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private (Admin)
exports.getSystemHealth = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const os = require('os');
    
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Database stats with real response time
    const dbStartTime = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
    } catch (err) {
      console.error('DB ping failed:', err);
    }
    const dbResponseTime = Date.now() - dbStartTime;
    
    // Get database size and statistics
    let dbStats = null;
    try {
      dbStats = await mongoose.connection.db.stats();
    } catch (err) {
      console.error('Failed to get DB stats:', err);
    }
    
    // Collection counts
    const farmerCount = await Farmer.countDocuments();
    const buyerCount = await Buyer.countDocuments();
    const cropCount = await Crop.countDocuments();
    const requestCount = await Request.countDocuments();

    // Memory usage
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU usage (average load)
    const cpuLoad = os.loadavg()[0]; // 1 minute average
    const cpuCount = os.cpus().length;
    const cpuUsagePercent = Math.min((cpuLoad / cpuCount) * 100, 100);

    // Check service health (simplified - could check actual endpoints)
    const servicesHealthy = {
      sms: true, // Could ping SMS service
      ivr: true, // Could ping IVR service
      notifications: true // Could check notification queue
    };

    // Determine overall status
    const overallStatus = dbStatus === 'connected' && 
                          cpuUsagePercent < 90 && 
                          (usedMem / totalMem) < 0.9 ? 'healthy' : 'warning';

    res.status(200).json({
      success: true,
      data: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
          responseTime: dbResponseTime,
          connections: mongoose.connection.readyState,
          size: dbStats ? {
            dataSize: Math.round((dbStats.dataSize || 0) / (1024 * 1024) * 100) / 100, // MB
            storageSize: Math.round((dbStats.storageSize || 0) / (1024 * 1024) * 100) / 100, // MB
            indexSize: Math.round((dbStats.indexSize || 0) / (1024 * 1024) * 100) / 100, // MB
            collections: dbStats.collections || 0,
            indexes: dbStats.indexes || 0,
            objects: dbStats.objects || 0
          } : null
        },
        server: {
          uptime: Math.round(process.uptime()),
          memory: {
            used: Math.round(memUsage.heapUsed / (1024 * 1024)),
            total: Math.round(memUsage.heapTotal / (1024 * 1024)),
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
            system: {
              total: Math.round(totalMem / (1024 * 1024)),
              used: Math.round(usedMem / (1024 * 1024)),
              free: Math.round(freeMem / (1024 * 1024)),
              percentage: Math.round((usedMem / totalMem) * 100)
            }
          },
          cpu: {
            usage: Math.round(cpuUsagePercent * 10) / 10,
            cores: cpuCount,
            loadAverage: os.loadavg().map(load => Math.round(load * 100) / 100)
          },
          platform: os.platform(),
          nodeVersion: process.version
        },
        services: servicesHealthy,
        counts: {
          farmers: farmerCount,
          buyers: buyerCount,
          crops: cropCount,
          requests: requestCount,
          total: farmerCount + buyerCount + cropCount + requestCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system stats
// @route   GET /api/admin/system/stats
// @access  Private (Admin)
exports.getSystemStats = async (req, res, next) => {
  try {
    // Get real active users (users active in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const activeFarmers = await Farmer.countDocuments({ 
      lastActive: { $gte: fifteenMinutesAgo } 
    });
    const activeBuyers = await Buyer.countDocuments({ 
      lastActive: { $gte: fifteenMinutesAgo } 
    });
    const activeUsers = activeFarmers + activeBuyers;

    // Get recent request activity (last minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentRequests = await Request.countDocuments({
      createdAt: { $gte: oneMinuteAgo }
    });

    // Calculate average response time from recent requests
    const recentCompletedRequests = await Request.find({
      status: 'completed',
      completedAt: { $exists: true },
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
    }).limit(100);

    let avgResponseTime = 0;
    if (recentCompletedRequests.length > 0) {
      const totalTime = recentCompletedRequests.reduce((sum, req) => {
        return sum + (new Date(req.completedAt) - new Date(req.createdAt));
      }, 0);
      avgResponseTime = Math.round(totalTime / recentCompletedRequests.length / 1000); // in seconds
    }

    // Error rate calculation (requests failed in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const totalRecentRequests = await Request.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });
    const failedRequests = await Request.countDocuments({
      status: { $in: ['cancelled', 'farmer_rejected'] },
      createdAt: { $gte: oneHourAgo }
    });
    const errorRate = totalRecentRequests > 0 
      ? Math.round((failedRequests / totalRecentRequests) * 1000) / 10 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        activeUsers,
        activeSessions: activeUsers, // Simplified: one session per user
        requestsPerMinute: recentRequests,
        averageResponseTime: avgResponseTime,
        errorRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate user report
// @route   GET /api/admin/reports/users
// @access  Private (Admin)
exports.generateUserReport = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let users = [];
    if (!role || role === 'farmer') {
      const farmers = await Farmer.find(query).select('-password -pin');
      users = [...users, ...farmers];
    }
    if (!role || role === 'buyer') {
      const buyers = await Buyer.find(query).select('-password -pin');
      users = [...users, ...buyers];
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate transaction report
// @route   GET /api/admin/reports/transactions
// @access  Private (Admin)
exports.generateTransactionReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const transactions = await Request.find(query)
      .populate('buyer', 'name mobile businessName')
      .populate('farmer', 'name mobile')
      .populate('crop', 'name category')
      .sort({ createdAt: -1 });

    // Calculate totals
    const summary = transactions.reduce((acc, req) => {
      const quantity = req.finalAgreement?.quantity?.value || req.requestedQuantity?.value || 0;
      const price = req.finalAgreement?.price?.value || req.offeredPrice?.value || 0;
      const value = quantity * price;

      return {
        totalTransactions: acc.totalTransactions + 1,
        totalQuantity: acc.totalQuantity + quantity,
        totalValue: acc.totalValue + value
      };
    }, { totalTransactions: 0, totalQuantity: 0, totalValue: 0 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      summary,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate revenue report
// @route   GET /api/admin/reports/revenue
// @access  Private (Admin)
exports.generateRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'completed' };
    if (startDate || endDate) {
      matchQuery.completedAt = {};
      if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
    }

    // Revenue by category
    const revenueByCategory = await Request.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$cropInfo.category',
          totalRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$finalAgreement.quantity.value', '$requestedQuantity.value'] },
                { $ifNull: ['$finalAgreement.price.value', '$offeredPrice.value'] }
              ]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Revenue over time
    const revenueOverTime = await Request.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          dailyRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$finalAgreement.quantity.value', '$requestedQuantity.value'] },
                { $ifNull: ['$finalAgreement.price.value', '$offeredPrice.value'] }
              ]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total revenue
    const totalRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.totalRevenue, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenueByCategory,
        revenueOverTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings/system
// @access  Private (Admin)
exports.getSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings/system
// @access  Private (Admin)
exports.updateSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    const adminId = req.user._id;
    
    const {
      emailSettings,
      smsSettings,
      notificationSettings,
      userSettings,
      sessionSettings,
      securitySettings,
      apiSettings,
      backupSettings,
      maintenanceMessage
    } = req.body;
    
    // Update settings
    if (emailSettings) settings.emailSettings = { ...settings.emailSettings, ...emailSettings };
    if (smsSettings) settings.smsSettings = { ...settings.smsSettings, ...smsSettings };
    if (notificationSettings) settings.notificationSettings = { ...settings.notificationSettings, ...notificationSettings };
    if (userSettings) settings.userSettings = { ...settings.userSettings, ...userSettings };
    if (sessionSettings) settings.sessionSettings = { ...settings.sessionSettings, ...sessionSettings };
    if (securitySettings) settings.securitySettings = { ...settings.securitySettings, ...securitySettings };
    if (apiSettings) settings.apiSettings = { ...settings.apiSettings, ...apiSettings };
    if (backupSettings) settings.backupSettings = { ...settings.backupSettings, ...backupSettings };
    if (maintenanceMessage) settings.maintenanceMessage = maintenanceMessage;
    
    settings.lastUpdatedBy = adminId;
    settings.lastUpdatedAt = new Date();
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle maintenance mode
// @route   POST /api/admin/settings/maintenance
// @access  Private (Admin)
exports.toggleMaintenanceMode = async (req, res, next) => {
  try {
    const { isOperational, reason } = req.body;
    const adminId = req.user._id;
    
    if (typeof isOperational !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOperational must be a boolean value'
      });
    }
    
    const settings = await SystemSettings.getSettings();
    await settings.toggleMaintenance(isOperational, adminId, reason || '');
    
    res.status(200).json({
      success: true,
      message: `System ${isOperational ? 'operational' : 'maintenance'} mode enabled`,
      data: {
        isOperational: settings.isOperational,
        maintenanceMessage: settings.maintenanceMessage,
        currentMaintenanceStart: settings.currentMaintenanceStart,
        maintenanceLogs: settings.maintenanceLogs.slice(-10) // Return last 10 logs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance logs
// @route   GET /api/admin/settings/maintenance/logs
// @access  Private (Admin)
exports.getMaintenanceLogs = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const settings = await SystemSettings.getSettings();
    
    const logs = settings.maintenanceLogs
      .sort((a, b) => b.startTime - a.startTime)
      .slice((page - 1) * limit, page * limit);
    
    const populatedLogs = await SystemSettings.populate(logs, {
      path: 'updatedBy',
      select: 'name email'
    });
    
    res.status(200).json({
      success: true,
      data: {
        logs: populatedLogs,
        total: settings.maintenanceLogs.length,
        page: parseInt(page),
        pages: Math.ceil(settings.maintenanceLogs.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
