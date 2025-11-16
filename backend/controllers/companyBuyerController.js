const Company = require('../models/Company');
const Buyer = require('../models/BuyerModel');
const Request = require('../models/Request');
const Crop = require('../models/Crop');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Get company dashboard stats
// @route   GET /api/buyers/company/dashboard
// @access  Private (Company Buyer)
exports.getCompanyDashboard = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    
    if (!buyer || buyer.buyerType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company buyer account required.'
      });
    }

    // Get or create company
    let company = await Company.findOne({ owner: req.user.id });
    
    if (!company) {
      // Create company if doesn't exist
      company = await Company.create({
        companyName: buyer.companyName || buyer.businessName,
        businessType: buyer.businessType || 'other',
        owner: req.user.id,
        email: buyer.email || `company${req.user.id}@temp.com`,
        phone: buyer.mobile,
        address: buyer.address
      });
    }

    // Get all employees including owner
    const allBuyerIds = [req.user.id, ...company.employees.map(emp => emp.user)];

    // Total requests by all company members
    const totalRequests = await Request.countDocuments({ 
      buyer: { $in: allBuyerIds }
    });

    const pendingRequests = await Request.countDocuments({
      buyer: { $in: allBuyerIds },
      status: 'pending'
    });

    const confirmedRequests = await Request.countDocuments({
      buyer: { $in: allBuyerIds },
      status: 'confirmed'
    });

    const completedRequests = await Request.countDocuments({
      buyer: { $in: allBuyerIds },
      status: 'completed'
    });

    // Recent team requests
    const recentRequests = await Request.find({
      buyer: { $in: allBuyerIds }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('buyer', 'name businessName')
      .populate('farmer', 'name mobile')
      .populate('crop', 'name category price quantity');

    // Available crops in market
    const availableCrops = await Crop.countDocuments({
      status: 'active',
      isVisible: true,
      availableQuantity: { $gt: 0 }
    });

    // Active employees
    const activeEmployees = company.employees.filter(emp => emp.isActive).length + 1; // +1 for owner

    // Calculate total inventory/stock from completed requests
    const stockData = await Request.aggregate([
      {
        $match: {
          buyer: { $in: allBuyerIds },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      {
        $unwind: '$cropInfo'
      },
      {
        $group: {
          _id: '$cropInfo.category',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$agreedPrice', '$quantity'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        company: {
          _id: company._id,
          companyName: company.companyName,
          businessType: company.businessType,
          subscriptionPlan: company.subscriptionPlan,
          maxEmployees: company.maxEmployees,
          isVerified: company.isVerified
        },
        stats: {
          totalRequests,
          pendingRequests,
          confirmedRequests,
          completedRequests,
          availableCrops,
          activeEmployees,
          totalStock: stockData.reduce((sum, item) => sum + item.totalQuantity, 0),
          stockValue: stockData.reduce((sum, item) => sum + item.totalValue, 0)
        },
        recentRequests,
        stockByCategory: stockData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company employees
// @route   GET /api/buyers/company/employees
// @access  Private (Company Buyer)
exports.getEmployees = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    
    if (!buyer || buyer.buyerType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company buyer account required.'
      });
    }

    const company = await Company.findOne({ owner: req.user.id })
      .populate('employees.user', 'name email mobile role')
      .populate('owner', 'name email mobile');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        owner: company.owner,
        employees: company.employees,
        pendingInvitations: company.pendingInvitations,
        maxEmployees: company.maxEmployees,
        canAddMore: company.canAddEmployee()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add employee to company
// @route   POST /api/buyers/company/employees
// @access  Private (Company Owner)
exports.addEmployee = async (req, res, next) => {
  try {
    const { email, mobile, role, permissions } = req.body;

    const buyer = await Buyer.findById(req.user.id);
    
    if (!buyer || buyer.buyerType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company buyer account required.'
      });
    }

    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if can add more employees
    if (!company.canAddEmployee()) {
      return res.status(400).json({
        success: false,
        message: `Maximum employee limit (${company.maxEmployees}) reached. Please upgrade your subscription.`
      });
    }

    // Check if user exists
    let employeeUser = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { mobile: mobile }
      ],
      role: 'buyer'
    });

    if (!employeeUser) {
      return res.status(404).json({
        success: false,
        message: 'Buyer user not found. User must register as a buyer first.'
      });
    }

    // Check if already an employee
    const isAlreadyEmployee = company.employees.some(
      emp => emp.user.toString() === employeeUser._id.toString()
    );

    if (isAlreadyEmployee) {
      return res.status(400).json({
        success: false,
        message: 'User is already an employee of this company'
      });
    }

    // Add employee
    company.employees.push({
      user: employeeUser._id,
      role: role || 'staff',
      permissions: permissions || {
        canCreateRequests: true,
        canManageWantedCrops: false,
        canViewReports: false,
        canManageEmployees: false,
        canEditCompanyProfile: false
      },
      isActive: true
    });

    await company.save();

    // Update buyer's company reference
    await Buyer.findByIdAndUpdate(employeeUser._id, {
      company: company._id
    });

    const updatedCompany = await Company.findById(company._id)
      .populate('employees.user', 'name email mobile');

    res.status(200).json({
      success: true,
      message: 'Employee added successfully',
      data: updatedCompany.employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/buyers/company/employees/:employeeId
// @access  Private (Company Owner)
exports.updateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { role, permissions, isActive } = req.body;

    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const employee = company.employees.id(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update fields
    if (role) employee.role = role;
    if (permissions) employee.permissions = { ...employee.permissions, ...permissions };
    if (typeof isActive === 'boolean') employee.isActive = isActive;

    await company.save();

    const updatedCompany = await Company.findById(company._id)
      .populate('employees.user', 'name email mobile');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedCompany.employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee
// @route   DELETE /api/buyers/company/employees/:employeeId
// @access  Private (Company Owner)
exports.removeEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const employee = company.employees.id(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Remove company reference from buyer
    await Buyer.findByIdAndUpdate(employee.user, {
      $unset: { company: 1 }
    });

    // Remove employee using pull
    company.employees.pull(employeeId);
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company stock/inventory
// @route   GET /api/buyers/company/stock
// @access  Private (Company Buyer)
exports.getCompanyStock = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    
    if (!buyer || buyer.buyerType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Company buyer account required.'
      });
    }

    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get all employees including owner
    const allBuyerIds = [req.user.id, ...company.employees.map(emp => emp.user)];

    // Get completed requests with crop details
    const completedRequests = await Request.find({
      buyer: { $in: allBuyerIds },
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .populate('buyer', 'name businessName')
      .populate('farmer', 'name mobile location')
      .populate('crop', 'name category price quantity unit');

    // Aggregate stock by crop
    const stockByCrop = await Request.aggregate([
      {
        $match: {
          buyer: { $in: allBuyerIds },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      {
        $unwind: '$cropInfo'
      },
      {
        $group: {
          _id: {
            cropName: '$cropInfo.name',
            category: '$cropInfo.category'
          },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$agreedPrice', '$quantity'] } },
          avgPrice: { $avg: '$agreedPrice' },
          count: { $sum: 1 },
          lastPurchased: { $max: '$completedAt' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);

    // Aggregate by category
    const stockByCategory = await Request.aggregate([
      {
        $match: {
          buyer: { $in: allBuyerIds },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      {
        $unwind: '$cropInfo'
      },
      {
        $group: {
          _id: '$cropInfo.category',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$agreedPrice', '$quantity'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        completedRequests,
        stockByCrop,
        stockByCategory,
        summary: {
          totalTransactions: completedRequests.length,
          totalQuantity: stockByCrop.reduce((sum, item) => sum + item.totalQuantity, 0),
          totalValue: stockByCrop.reduce((sum, item) => sum + item.totalValue, 0),
          uniqueCrops: stockByCrop.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
