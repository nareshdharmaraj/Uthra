const Crop = require('../models/Crop');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
exports.getAllCrops = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const crops = await Crop.find({
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmer', 'name location');

    const count = await Crop.countDocuments({
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    });

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

// @desc    Get crop by ID
// @route   GET /api/crops/:id
// @access  Public
exports.getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name location mobile');

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

// @desc    Search crops
// @route   POST /api/crops/search
// @access  Public
exports.searchCrops = async (req, res, next) => {
  try {
    const { searchTerm, category, district } = req.body;

    const query = {
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (district) query['pickupLocation.district'] = district;

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .populate('farmer', 'name location');

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crops by category
// @route   GET /api/crops/category/:category
// @access  Public
exports.getCropsByCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const crops = await Crop.find({
      category: req.params.category,
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmer', 'name location');

    const count = await Crop.countDocuments({
      category: req.params.category,
      status: 'active',
      isVisible: true
    });

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
