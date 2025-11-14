const crypto = require('crypto');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Buyer)
exports.createCompany = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const {
      companyName,
      businessType,
      description,
      yearEstablished,
      gstNumber,
      panNumber,
      email,
      phone,
      website,
      address
    } = req.body;

    // Check if user already owns a company
    const existingCompany = await Company.findOne({ owner: req.user.id });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'You already own a company. Each user can own only one company.'
      });
    }

    // Create company
    const company = await Company.create({
      companyName,
      businessType,
      description,
      yearEstablished,
      gstNumber,
      panNumber,
      email,
      phone,
      website,
      address,
      owner: req.user.id
    });

    // Update user's buyerType and company reference
    await User.findByIdAndUpdate(req.user.id, {
      buyerType: 'company',
      company: company._id
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company profile
// @route   GET /api/companies/profile
// @access  Private (Buyer - Company Member)
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company)
      .populate('owner', 'name email mobile')
      .populate('employees.user', 'name email mobile');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private (Company Owner or Manager with permission)
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    if (!company.hasPermission(req.user.id, 'canEditCompanyProfile')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit company profile'
      });
    }

    // Update allowed fields
    const {
      companyName,
      description,
      email,
      phone,
      website,
      address,
      preferences,
      paymentTerms,
      deliveryCapabilities,
      bankDetails
    } = req.body;

    if (companyName) company.companyName = companyName;
    if (description) company.description = description;
    if (email) company.email = email;
    if (phone) company.phone = phone;
    if (website) company.website = website;
    if (address) company.address = { ...company.address, ...address };
    if (preferences) company.preferences = { ...company.preferences, ...preferences };
    if (paymentTerms) company.paymentTerms = { ...company.paymentTerms, ...paymentTerms };
    if (deliveryCapabilities) company.deliveryCapabilities = { ...company.deliveryCapabilities, ...deliveryCapabilities };
    if (bankDetails) company.bankDetails = { ...company.bankDetails, ...bankDetails };

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite employee to company
// @route   POST /api/companies/employees/invite
// @access  Private (Company Owner or Manager with permission)
exports.inviteEmployee = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const { email, mobile, role } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    if (!company.hasPermission(req.user.id, 'canManageEmployees')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to invite employees'
      });
    }

    // Check if company can add more employees
    if (!company.canAddEmployee()) {
      return res.status(400).json({
        success: false,
        message: `Company has reached maximum employee limit (${company.maxEmployees}). Please upgrade your plan.`
      });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Add to pending invitations
    company.pendingInvitations.push({
      email,
      mobile,
      role,
      invitationToken,
      expiresAt
    });

    await company.save();

    // TODO: Send invitation email/SMS with token
    // For now, just return the token
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${invitationToken}`;

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationLink,
        expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept company invitation
// @route   POST /api/companies/employees/accept-invitation
// @access  Private (Buyer)
exports.acceptInvitation = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const { invitationToken } = req.body;

    // Find company with this invitation
    const company = await Company.findOne({
      'pendingInvitations.invitationToken': invitationToken,
      'pendingInvitations.expiresAt': { $gte: new Date() }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    const invitation = company.pendingInvitations.find(
      inv => inv.invitationToken === invitationToken
    );

    // Check if user already belongs to a company
    const user = await User.findById(req.user.id);
    if (user.company) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a company'
      });
    }

    // Add user as employee
    company.employees.push({
      user: req.user.id,
      role: invitation.role,
      permissions: getDefaultPermissions(invitation.role)
    });

    // Remove from pending invitations
    company.pendingInvitations = company.pendingInvitations.filter(
      inv => inv.invitationToken !== invitationToken
    );

    await company.save();

    // Update user
    user.buyerType = 'company';
    user.company = company._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined company',
      data: { company: company._id, role: invitation.role }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/companies/employees
// @access  Private (Company Member)
exports.getEmployees = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company)
      .populate('employees.user', 'name email mobile isActive lastLogin');

    res.status(200).json({
      success: true,
      data: {
        employees: company.employees,
        pendingInvitations: company.pendingInvitations
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee permissions
// @route   PUT /api/companies/employees/:employeeId
// @access  Private (Company Owner or Manager with permission)
exports.updateEmployee = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const { role, permissions } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    if (!company.hasPermission(req.user.id, 'canManageEmployees')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage employees'
      });
    }

    // Find employee
    const employee = company.employees.id(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update employee
    if (role) employee.role = role;
    if (permissions) employee.permissions = { ...employee.permissions, ...permissions };

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee from company
// @route   DELETE /api/companies/employees/:employeeId
// @access  Private (Company Owner or Manager with permission)
exports.removeEmployee = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    if (!company.hasPermission(req.user.id, 'canManageEmployees')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove employees'
      });
    }

    // Find employee
    const employee = company.employees.id(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employeeUserId = employee.user;

    // Deactivate instead of removing
    employee.isActive = false;
    await company.save();

    // Update user
    await User.findByIdAndUpdate(employeeUserId, {
      $unset: { company: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave company (for employees)
// @route   POST /api/companies/leave
// @access  Private (Company Employee)
exports.leaveCompany = async (req, res, next) => {
  try {
    const getCompanyModel = () => require('../models/Company');
    const getUserModel = () => require('../models/User');
    const Company = getCompanyModel();
    const User = getUserModel();
    
    const user = await User.findById(req.user.id);
    
    if (!user.company) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any company'
      });
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner
    if (company.isOwner(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Company owner cannot leave. Please transfer ownership or delete the company.'
      });
    }

    // Remove employee
    const employee = company.getEmployee(req.user.id);
    if (employee) {
      employee.isActive = false;
      await company.save();
    }

    // Update user
    user.company = undefined;
    user.buyerType = 'individual';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the company'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get default permissions based on role
function getDefaultPermissions(role) {
  const permissions = {
    manager: {
      canCreateRequests: true,
      canManageWantedCrops: true,
      canViewReports: true,
      canManageEmployees: true,
      canEditCompanyProfile: true
    },
    buyer: {
      canCreateRequests: true,
      canManageWantedCrops: false,
      canViewReports: false,
      canManageEmployees: false,
      canEditCompanyProfile: false
    },
    procurement_officer: {
      canCreateRequests: true,
      canManageWantedCrops: true,
      canViewReports: true,
      canManageEmployees: false,
      canEditCompanyProfile: false
    },
    staff: {
      canCreateRequests: true,
      canManageWantedCrops: false,
      canViewReports: false,
      canManageEmployees: false,
      canEditCompanyProfile: false
    }
  };

  return permissions[role] || permissions.staff;
}
