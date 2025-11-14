const Request = require('../models/Request');

// @desc    Get requests
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    
    // Filter by user role
    if (req.user.role === 'farmer') {
      query.farmer = req.user.id;
    } else if (req.user.role === 'buyer') {
      query.buyer = req.user.id;
    }

    if (status) query.status = status;

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('buyer', 'name mobile')
      .populate('farmer', 'name mobile')
      .populate('crop', 'name category');

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

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('buyer', 'name mobile location')
      .populate('farmer', 'name mobile location')
      .populate('crop');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      request.farmer.toString() !== req.user.id &&
      request.buyer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
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
