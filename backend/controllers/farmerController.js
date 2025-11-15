const Crop = require('../models/Crop');
const Request = require('../models/Request');
const CallLog = require('../models/CallLog');
const User = require('../models/User');

// @desc    Add new crop
// @route   POST /api/farmers/crops
// @access  Private (Farmer)
exports.addCrop = async (req, res, next) => {
  try {
    const cropData = {
      ...req.body,
      farmer: req.user.id,
      entryMethod: 'web'
    };

    const crop = await Crop.create(cropData);

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's crops
// @route   GET /api/farmers/crops
// @access  Private (Farmer)
exports.getMyCrops = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { farmer: req.user.id };
    if (status) query.status = status;

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Crop.countDocuments(query);

    res.status(200).json({
      success: true,
      count: crops.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop details
// @route   GET /api/farmers/crops/:id
// @access  Private (Farmer)
exports.getCropDetails = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

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

// @desc    Update crop
// @route   PUT /api/farmers/crops/:id
// @access  Private (Farmer)
exports.updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    crop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop
// @route   DELETE /api/farmers/crops/:id
// @access  Private (Farmer)
exports.deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    crop.status = 'removed';
    crop.isVisible = false;
    await crop.save();

    res.status(200).json({
      success: true,
      message: 'Crop removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's requests
// @route   GET /api/farmers/requests
// @access  Private (Farmer)
exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    const query = { farmer: req.user.id };
    if (status) query.status = status;

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('buyer', 'name mobile location')
      .populate('crop', 'name category price quantity');

    const count = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request details
// @route   GET /api/farmers/requests/:id
// @access  Private (Farmer)
exports.getRequestDetails = async (req, res, next) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      farmer: req.user.id
    })
      .populate('buyer', 'name mobile location buyerDetails')
      .populate('crop');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Mark as viewed if pending
    if (request.status === 'pending') {
      await request.updateStatus('viewed');
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept request
// @route   PUT /api/farmers/requests/:id/accept
// @access  Private (Farmer)
exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await request.updateStatus('farmer_accepted', 'Farmer accepted the request');

    // TODO: Send SMS notification to buyer
    // TODO: Update crop quantity

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject request
// @route   PUT /api/farmers/requests/:id/reject
// @access  Private (Farmer)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const request = await Request.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.farmerNote = reason;
    await request.updateStatus('farmer_rejected', reason || 'Farmer rejected the request');

    // TODO: Send SMS notification to buyer

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Counter offer
// @route   PUT /api/farmers/requests/:id/counter
// @access  Private (Farmer)
exports.counterOffer = async (req, res, next) => {
  try {
    const { price, quantity, note } = req.body;

    const request = await Request.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.counterOffer = {
      price: price || request.offeredPrice,
      quantity: quantity || request.requestedQuantity,
      note,
      offeredAt: new Date()
    };

    await request.updateStatus('farmer_countered', 'Farmer made a counter offer');

    // TODO: Send SMS notification to buyer

    res.status(200).json({
      success: true,
      message: 'Counter offer sent',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/farmers/dashboard
// @access  Private (Farmer)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalCrops = await Crop.countDocuments({ farmer: req.user.id });
    const activeCrops = await Crop.countDocuments({ 
      farmer: req.user.id, 
      status: 'active' 
    });
    const soldOutCrops = await Crop.countDocuments({ 
      farmer: req.user.id, 
      status: 'sold_out' 
    });
    const expiredCrops = await Crop.countDocuments({ 
      farmer: req.user.id, 
      status: 'expired' 
    });

    const totalRequests = await Request.countDocuments({
      farmer: req.user.id
    });

    const pendingRequests = await Request.countDocuments({
      farmer: req.user.id,
      status: { $in: ['pending', 'viewed'] }
    });

    const acceptedRequests = await Request.countDocuments({
      farmer: req.user.id,
      status: { $in: ['farmer_accepted', 'buyer_accepted', 'confirmed'] }
    });

    const counteredRequests = await Request.countDocuments({
      farmer: req.user.id,
      status: 'farmer_countered'
    });

    const recentRequests = await Request.find({
      farmer: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'name mobile')
      .populate('crop', 'name');

    const recentCrops = await Crop.find({
      farmer: req.user.id,
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCrops,
          activeCrops,
          soldOutCrops,
          expiredCrops,
          totalRequests,
          pendingRequests,
          acceptedRequests,
          counteredRequests
        },
        recentRequests,
        recentCrops
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get call logs
// @route   GET /api/farmers/call-logs
// @access  Private (Farmer)
exports.getCallLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const callLogs = await CallLog.find({ farmer: req.user.id })
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CallLog.countDocuments({ farmer: req.user.id });

    res.status(200).json({
      success: true,
      count: callLogs.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: callLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer profile
// @route   GET /api/farmers/profile
// @access  Private (Farmer)
exports.getProfile = async (req, res, next) => {
  try {
    const farmer = await User.findById(req.user.id).select('-password -pin');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farmer profile
// @route   PUT /api/farmers/profile
// @access  Private (Farmer)
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'email',
      'location',
      'farmerDetails',
      'profilePicture'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -pin');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: farmer
    });
  } catch (error) {
    next(error);
  }
};
