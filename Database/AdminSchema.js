// Admin collection - stores ALL admin data (auth + permissions)
const { mongoose } = require('../backend/config/database');

const adminSchema = new mongoose.Schema({
  // Authentication fields
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  
  password: {
    type: String,
    required: true
  },
  
  // Location
  location: {
    district: String,
    taluk: String,
    village: String,
    pincode: String
  },
  
  // Registration tracking
  registrationStage: {
    type: Number,
    default: 3
  },
  
  registrationCompleted: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Admin level/role
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin'
  },
  
  // Permissions
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageFarmers: { type: Boolean, default: true },
    manageBuyers: { type: Boolean, default: true },
    manageCompanies: { type: Boolean, default: false },
    manageCrops: { type: Boolean, default: true },
    manageRequests: { type: Boolean, default: true },
    viewReports: { type: Boolean, default: true },
    manageSettings: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false },
    sendNotifications: { type: Boolean, default: true },
    handleDisputes: { type: Boolean, default: true },
    verifyUsers: { type: Boolean, default: true },
    accessLogs: { type: Boolean, default: false }
  },
  
  // Department/Team
  department: {
    type: String,
    enum: ['operations', 'support', 'verification', 'finance', 'technical', 'other'],
    default: 'operations'
  },
  
  // Activity stats
  stats: {
    totalActions: { type: Number, default: 0 },
    usersVerified: { type: Number, default: 0 },
    disputesResolved: { type: Number, default: 0 },
    notificationsSent: { type: Number, default: 0 }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastActiveAt: Date,
  
  // Notes about this admin
  notes: String,
  
  // Created by (super admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
  
}, {
  timestamps: true
});

// Indexes
adminSchema.index({ mobile: 1 }, { unique: true });
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ adminLevel: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ department: 1 });

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
