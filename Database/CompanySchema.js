// Use the connected mongoose instance from database config
const { mongoose } = require('../Backend/config/database');

const companySchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'restaurant', 'exporter', 'processor', 'other'],
    required: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  yearEstablished: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  
  // Registration Details
  gstNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  panNumber: {
    type: String,
    trim: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  website: {
    type: String,
    trim: true
  },
  
  // Location
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Employees
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'buyer', 'procurement_officer', 'staff'],
      default: 'staff'
    },
    permissions: {
      canCreateRequests: { type: Boolean, default: true },
      canManageWantedCrops: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageEmployees: { type: Boolean, default: false },
      canEditCompanyProfile: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Pending Invitations
  pendingInvitations: [{
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    role: {
      type: String,
      enum: ['manager', 'buyer', 'procurement_officer', 'staff'],
      default: 'staff'
    },
    invitationToken: { type: String },
    invitedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
  }],
  
  // Business Preferences
  preferences: {
    preferredCategories: [{ type: String }],
    preferredDistricts: [{ type: String }],
    qualityStandards: { type: String, enum: ['organic', 'conventional', 'any'], default: 'any' }
  },
  
  // Payment & Delivery
  paymentTerms: {
    preferredMethod: { 
      type: String, 
      enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'mixed'],
      default: 'bank_transfer'
    },
    advancePayment: { type: Boolean, default: false },
    creditDays: { type: Number, default: 0 }
  },
  
  deliveryCapabilities: {
    hasOwnTransport: { type: Boolean, default: false },
    maxDeliveryRadius: { type: Number }, // in km
    preferredPickupLocations: [{ type: String }]
  },
  
  // Bank Details
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String }
  },
  
  // Subscription & Status
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  
  subscriptionExpiry: {
    type: Date
  },
  
  maxEmployees: {
    type: Number,
    default: 5 // Free plan limit
  },
  
  // Company Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDocuments: [{
    type: { type: String, enum: ['gst_certificate', 'pan_card', 'registration_certificate', 'other'] },
    fileUrl: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  
  // Statistics
  stats: {
    totalRequests: { type: Number, default: 0 },
    completedDeals: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    activeEmployees: { type: Number, default: 0 }
  },
  
  // Notes & Internal Use
  notes: { type: String },
  
}, {
  timestamps: true
});

// Indexes
companySchema.index({ owner: 1 });
companySchema.index({ 'employees.user': 1 });
companySchema.index({ gstNumber: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ subscriptionPlan: 1 });

// Virtual for active employees count
companySchema.virtual('activeEmployeesCount').get(function() {
  return this.employees.filter(emp => emp.isActive).length;
});

// Method to check if user is owner
companySchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

// Method to check if user is employee
companySchema.methods.isEmployee = function(userId) {
  return this.employees.some(emp => 
    emp.user.toString() === userId.toString() && emp.isActive
  );
};

// Method to get employee by userId
companySchema.methods.getEmployee = function(userId) {
  return this.employees.find(emp => 
    emp.user.toString() === userId.toString()
  );
};

// Method to check employee permission
companySchema.methods.hasPermission = function(userId, permission) {
  if (this.isOwner(userId)) return true; // Owner has all permissions
  
  const employee = this.getEmployee(userId);
  if (!employee || !employee.isActive) return false;
  
  return employee.permissions[permission] === true;
};

// Method to check if can add more employees
companySchema.methods.canAddEmployee = function() {
  return this.activeEmployeesCount < this.maxEmployees;
};

// Pre-save middleware to update stats
companySchema.pre('save', function(next) {
  this.stats.activeEmployees = this.employees.filter(emp => emp.isActive).length;
  next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
