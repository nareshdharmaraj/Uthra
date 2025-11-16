const Crop = require('../models/Crop');
const Request = require('../models/Request');
const User = require('../models/User');
const Buyer = require('../models/BuyerModel');
const Farmer = require('../models/Farmer');

// Helper function to update crop quantities based on request status changes
const updateCropQuantities = async (request, oldStatus, newStatus) => {
  try {
    const crop = await Crop.findById(request.crop);
    if (!crop) return;

    const quantity = request.requestedQuantity?.value || 0;
    const unit = request.requestedQuantity?.unit || 'kg';

    // Handle status transitions
    if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
      // Moving to confirmed: reduce available, increase booked
      crop.availableQuantity.value = Math.max(0, crop.availableQuantity.value - quantity);
      crop.bookedQuantity.value = (crop.bookedQuantity.value || 0) + quantity;
      crop.bookedQuantity.unit = unit;
    } else if (newStatus === 'completed' && oldStatus === 'confirmed') {
      // Moving from confirmed to completed: reduce booked, increase sold
      crop.bookedQuantity.value = Math.max(0, (crop.bookedQuantity.value || 0) - quantity);
      crop.soldQuantity.value = (crop.soldQuantity.value || 0) + quantity;
      crop.soldQuantity.unit = unit;
    } else if (newStatus === 'cancelled' && oldStatus === 'confirmed') {
      // Moving from confirmed to cancelled: reduce booked, restore available
      crop.bookedQuantity.value = Math.max(0, (crop.bookedQuantity.value || 0) - quantity);
      crop.availableQuantity.value = crop.availableQuantity.value + quantity;
    }

    // Update crop status if needed
    if (crop.availableQuantity.value === 0 && crop.bookedQuantity.value === 0) {
      crop.status = 'sold_out';
    } else if (crop.status === 'sold_out' && (crop.availableQuantity.value > 0 || crop.bookedQuantity.value > 0)) {
      crop.status = 'active';
    }

    await crop.save();
  } catch (error) {
    console.error('Error updating crop quantities:', error);
    // Don't throw - we don't want to fail the request update if quantity update fails
  }
};

// @desc    Browse all crops
// @route   GET /api/buyers/crops
// @access  Private (Buyer)
exports.browseCrops = async (req, res, next) => {
  try {
    const { 
      category, 
      district, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    };

    if (category) query.category = category;
    if (district) query['pickupLocation.district'] = district;
    if (minPrice || maxPrice) {
      query['price.value'] = {};
      if (minPrice) query['price.value'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.value'].$lte = parseFloat(maxPrice);
    }

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('farmer', 'name location mobile');

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
// @route   GET /api/buyers/crops/:id
// @access  Private (Buyer)
exports.getCropDetails = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name location mobile farmerDetails');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Increment view count
    crop.viewCount += 1;
    await crop.save();

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search crops
// @route   POST /api/buyers/crops/search
// @access  Private (Buyer)
exports.searchCrops = async (req, res, next) => {
  try {
    const { searchTerm, filters, page = 1, limit = 20 } = req.body;

    const query = {
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    };

    // Text search
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Apply filters
    if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.district) query['pickupLocation.district'] = filters.district;
      if (filters.quality) query.quality = filters.quality;
    }

    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmer', 'name location mobile')
      .lean();

    // Check if buyer has existing requests with these farmers
    const buyerId = req.user.id;
    const farmerIds = [...new Set(crops.map(c => c.farmer?._id?.toString()).filter(Boolean))];
    
    const existingRequests = await Request.find({
      buyer: buyerId,
      farmer: { $in: farmerIds },
      status: { $in: ['pending', 'viewed', 'farmer_accepted', 'farmer_countered', 'buyer_accepted', 'confirmed'] }
    }).select('farmer crop').lean();

    // Add booking info to crops
    const cropsWithBookingInfo = crops.map(crop => {
      const hasPendingRequest = existingRequests.some(req => 
        req.farmer?.toString() === crop.farmer?._id?.toString()
      );
      return {
        ...crop,
        hasPendingRequestWithFarmer: hasPendingRequest
      };
    });

    const count = await Crop.countDocuments(query);

    res.status(200).json({
      success: true,
      count: crops.length,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: cropsWithBookingInfo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create request
// @route   POST /api/buyers/requests
// @access  Private (Buyer)
exports.createRequest = async (req, res, next) => {
  try {
    const { cropId, requestedQuantity, offeredPrice, deliveryAddress, buyerNote } = req.body;

    // Get crop details
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    if (!crop.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Crop is no longer available'
      });
    }

    // Create request with proper structure
    const request = await Request.create({
      buyer: req.user.id,
      crop: cropId,
      farmer: crop.farmer,
      requestedQuantity: {
        value: typeof requestedQuantity === 'number' ? requestedQuantity : requestedQuantity.value,
        unit: requestedQuantity.unit || crop.quantity.unit
      },
      offeredPrice: {
        value: typeof offeredPrice === 'number' ? offeredPrice : offeredPrice.value,
        unit: offeredPrice.unit || crop.price.unit
      },
      deliveryAddress: deliveryAddress || req.user.location,
      buyerNote,
      status: 'pending'
    });

    // Increment request count on crop
    crop.requestCount += 1;
    await crop.save();

    // TODO: Send SMS/IVR notification to farmer

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer's requests
// @route   GET /api/buyers/requests
// @access  Private (Buyer)
exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    const query = { buyer: req.user.id };
    if (status) query.status = status;

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('farmer', 'name mobile location')
      .populate('crop', 'name category price quantity availableQuantity status');

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
// @route   GET /api/buyers/requests/:id
// @access  Private (Buyer)
exports.getRequestDetails = async (req, res, next) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user.id
    })
      .populate('farmer', 'name mobile location farmerDetails')
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

// @desc    Accept counter offer
// @route   PUT /api/buyers/requests/:id/accept
// @access  Private (Buyer)
exports.acceptCounterOffer = async (req, res, next) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'farmer_countered') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept counter offer. Request status is '${request.status}'. Expected 'farmer_countered'.`
      });
    }

    // Set final agreement
    request.finalAgreement = {
      quantity: request.counterOffer.quantity,
      price: request.counterOffer.price,
      agreedAt: new Date()
    };

    const oldStatus = request.status;
    await request.updateStatus('confirmed', 'Buyer accepted counter offer');

    // Update crop quantities
    await updateCropQuantities(request, oldStatus, 'confirmed');

    // TODO: Send SMS notification to farmer

    res.status(200).json({
      success: true,
      message: 'Counter offer accepted',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request
// @route   PUT /api/buyers/requests/:id/cancel
// @access  Private (Buyer)
exports.cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.buyerNote = reason;
    await request.updateStatus('cancelled', reason || 'Buyer cancelled the request');

    res.status(200).json({
      success: true,
      message: 'Request cancelled'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/buyers/dashboard
// @access  Private (Buyer)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalRequests = await Request.countDocuments({ buyer: req.user.id });
    const pendingRequests = await Request.countDocuments({
      buyer: req.user.id,
      status: 'pending'
    });
    const confirmedRequests = await Request.countDocuments({
      buyer: req.user.id,
      status: 'confirmed'
    });

    const recentRequests = await Request.find({
      buyer: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'name mobile')
      .populate('crop', 'name');

    const availableCrops = await Crop.countDocuments({
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRequests,
          pendingRequests,
          confirmedRequests,
          availableCrops
        },
        recentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate farmer
// @route   POST /api/buyers/requests/:id/rate
// @access  Private (Buyer)
exports.rateFarmer = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed requests'
      });
    }

    request.buyerRating = {
      rating,
      review,
      ratedAt: new Date()
    };
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer profile
// @route   GET /api/buyers/profile
// @access  Private (Buyer)
exports.getProfile = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const buyer = await Buyer.findById(req.user.id).select('-password -pin');

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Initialize buyerDetails if it doesn't exist
    if (!buyer.buyerDetails) {
      buyer.buyerDetails = {
        preferredCategories: [],
        wantedCrops: [],
        deliveryCapabilities: {},
        paymentTerms: { preferredMethod: 'bank_transfer', creditDays: 0 },
        bankDetails: {}
      };
      await buyer.save();
    }

    res.status(200).json({
      success: true,
      data: buyer
    });
  } catch (error) {
    console.error('Get buyer profile error:', error);
    next(error);
  }
};

// @desc    Update buyer profile
// @route   PUT /api/buyers/profile
// @access  Private (Buyer)
exports.updateProfile = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const {
      name,
      email,
      location,
      buyerDetails
    } = req.body;

    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Update basic info
    if (name) buyer.name = name;
    if (email) buyer.email = email;
    if (location) buyer.location = { ...buyer.location, ...location };
    
    // Update buyer-specific details
    if (buyerDetails) {
      buyer.buyerDetails = { ...buyer.buyerDetails, ...buyerDetails };
    }

    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: buyer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add wanted crop
// @route   POST /api/buyers/wanted-crops
// @access  Private (Buyer)
exports.addWantedCrop = async (req, res, next) => {
  try {
    // Lazy load User model
    
    console.log('Add Wanted Crop Request Body:', req.body);
    
    const {
      cropName,
      category,
      requiredQuantity,
      unit,
      budgetPerUnit,
      frequency,
      districts,
      qualityPreference,
      notes
    } = req.body;

    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    console.log('Buyer before adding crop:', {
      id: buyer._id,
      hasWantedCrops: !!buyer.wantedCrops,
      existingCropsCount: buyer.wantedCrops?.length || 0
    });

    // Initialize wantedCrops if not exists
    if (!buyer.wantedCrops) {
      buyer.wantedCrops = [];
    }

    const newCrop = {
      cropName,
      category,
      requiredQuantity,
      unit: unit || 'kg',
      budgetPerUnit,
      frequency,
      districts: districts || [],
      qualityPreference: qualityPreference || 'any',
      notes,
      active: true,
      createdAt: new Date()
    };

    console.log('New crop to add:', newCrop);

    // Add new wanted crop
    buyer.wantedCrops.push(newCrop);

    await buyer.save();

    console.log('Buyer after save:', {
      wantedCropsCount: buyer.wantedCrops.length,
      lastCrop: buyer.wantedCrops[buyer.wantedCrops.length - 1]
    });

    res.status(201).json({
      success: true,
      message: 'Wanted crop added successfully',
      data: buyer.wantedCrops
    });
  } catch (error) {
    console.error('Add Wanted Crop Error:', error);
    next(error);
  }
};

// @desc    Update wanted crop
// @route   PUT /api/buyers/wanted-crops/:cropId
// @access  Private (Buyer)
exports.updateWantedCrop = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    const wantedCrop = buyer.wantedCrops.id(req.params.cropId);

    if (!wantedCrop) {
      return res.status(404).json({
        success: false,
        message: 'Wanted crop not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      wantedCrop[key] = req.body[key];
    });

    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Wanted crop updated successfully',
      data: wantedCrop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete wanted crop
// @route   DELETE /api/buyers/wanted-crops/:cropId
// @access  Private (Buyer)
exports.deleteWantedCrop = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    buyer.wantedCrops.id(req.params.cropId).remove();
    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Wanted crop removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wanted crops
// @route   GET /api/buyers/wanted-crops
// @access  Private (Buyer)
exports.getWantedCrops = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const buyer = await Buyer.findById(req.user.id).select('wantedCrops');

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    console.log('Get Wanted Crops - Buyer ID:', req.user.id);
    console.log('Get Wanted Crops - Wanted Crops Count:', buyer.wantedCrops?.length || 0);
    console.log('Get Wanted Crops - Crops:', buyer.wantedCrops);

    res.status(200).json({
      success: true,
      total: buyer.wantedCrops?.length || 0,
      data: buyer.wantedCrops || []
    });
  } catch (error) {
    console.error('Get Wanted Crops Error:', error);
    next(error);
  }
};

// @desc    Search farmers
// @route   POST /api/buyers/farmers/search
// @access  Private (Buyer)
exports.searchFarmers = async (req, res, next) => {
  try {
    // Lazy load User model
    
    const { 
      searchTerm, 
      district, 
      state,
      farmingType,
      hasActiveCrops,
      page = 1, 
      limit = 20 
    } = req.body;

    const query = {
      role: 'farmer',
      isActive: true,
      registrationCompleted: true
    };

    // Text search
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { 'location.village': { $regex: searchTerm, $options: 'i' } },
        { 'location.district': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Location filters (case-insensitive)
    if (district) query['location.district'] = { $regex: district, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (farmingType) query['farmerDetails.farmingType'] = farmingType;

    let farmers = await Farmer.find(query)
      .select('name mobile location farmerDetails createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // If hasActiveCrops filter, get crop counts
    if (hasActiveCrops) {
      const farmersWithCrops = await Promise.all(
        farmers.map(async (farmer) => {
          const cropCount = await Crop.countDocuments({
            farmer: farmer._id,
            status: 'active',
            isVisible: true
          });
          return { ...farmer, activeCrops: cropCount };
        })
      );
      
      farmers = farmersWithCrops.filter(f => f.activeCrops > 0);
    } else {
      // Add crop counts for all
      farmers = await Promise.all(
        farmers.map(async (farmer) => {
          const cropCount = await Crop.countDocuments({
            farmer: farmer._id,
            status: 'active',
            isVisible: true
          });
          return { ...farmer, activeCrops: cropCount };
        })
      );
    }

    const count = await Farmer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: farmers.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: farmers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer details
// @route   GET /api/buyers/farmers/:id
// @access  Private (Buyer)
exports.getFarmerDetails = async (req, res, next) => {
  try {
    
    const farmer = await Farmer.findById(req.params.id).select('-password -pin');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Get farmer's active crops
    const crops = await Crop.find({
      farmer: farmer._id,
      status: 'active',
      isVisible: true
    });

    res.status(200).json({
      success: true,
      data: {
        farmer,
        crops
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settings
// @route   GET /api/buyers/settings
// @access  Private (Buyer)
exports.getSettings = async (req, res, next) => {
  try {
    
    const buyer = await Buyer.findById(req.user.id).select('buyerDetails.settings');

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    const settings = buyer.buyerDetails?.settings || {
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        ivrCalls: false,
        newCropAlerts: true,
        priceChangeAlerts: true,
        requestUpdates: true,
        promotionalMessages: false
      },
      privacy: {
        profileVisibility: 'public',
        showContactInfo: true,
        allowFarmerContact: true,
        dataSharing: false
      },
      language: 'en'
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/buyers/settings/notifications
// @access  Private (Buyer)
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    if (!buyer.buyerDetails) {
      buyer.buyerDetails = {};
    }
    if (!buyer.buyerDetails.settings) {
      buyer.buyerDetails.settings = {};
    }

    buyer.buyerDetails.settings.notifications = req.body;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/buyers/settings/password
// @access  Private (Buyer)
exports.changePassword = async (req, res, next) => {
  try {
    
    const { currentPassword, newPassword } = req.body;

    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Check current password
    const isMatch = await buyer.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    buyer.password = newPassword;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/buyers/settings/privacy
// @access  Private (Buyer)
exports.updatePrivacySettings = async (req, res, next) => {
  try {
    
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    if (!buyer.buyerDetails) {
      buyer.buyerDetails = {};
    }
    if (!buyer.buyerDetails.settings) {
      buyer.buyerDetails.settings = {};
    }

    buyer.buyerDetails.settings.privacy = req.body;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update language settings
// @route   PUT /api/buyers/settings/language
// @access  Private (Buyer)
exports.updateLanguageSettings = async (req, res, next) => {
  try {
    
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    if (!buyer.buyerDetails) {
      buyer.buyerDetails = {};
    }
    if (!buyer.buyerDetails.settings) {
      buyer.buyerDetails.settings = {};
    }

    buyer.buyerDetails.settings.language = req.body.language;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Language preference updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export user data
// @route   GET /api/buyers/settings/export-data
// @access  Private (Buyer)
exports.exportData = async (req, res, next) => {
  try {
    
    const buyer = await Buyer.findById(req.user.id).select('-password -pin');
    const requests = await Request.find({ buyer: req.user.id });

    const exportData = {
      profile: buyer,
      requests: requests,
      exportDate: new Date()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=buyer-data.json');
    res.status(200).json(exportData);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/buyers/settings/delete-account
// @access  Private (Buyer)
exports.deleteAccount = async (req, res, next) => {
  try {
    
    // Mark account as deleted instead of hard delete
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    buyer.isActive = false;
    buyer.deletedAt = new Date();
    await buyer.save();

    // Cancel all pending requests
    await Request.updateMany(
      { buyer: req.user.id, status: { $in: ['pending', 'counter-offered'] } },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Account deletion request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};
