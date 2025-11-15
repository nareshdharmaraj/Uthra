// Base User schema - contains only common authentication and contact fields
// Role-specific data is stored in Farmer, Buyer, or Admin collections
const { mongoose } = require('../backend/config/database');

const baseUserSchema = new mongoose.Schema({
  // Common fields for all users
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
    trim: true,
    lowercase: true,
    sparse: true, // Allows multiple null values
    validate: {
      validator: function(v) {
        return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  
  role: {
    type: String,
    enum: ['admin', 'farmer', 'buyer'],
    required: true
  },
  
  // Authentication - PIN for farmers (IVR), password for buyers/admins
  pin: {
    type: String,
    required: function() {
      return this.role === 'farmer' && this.registrationCompleted === true;
    },
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{4,6}$/.test(v);
      },
      message: props => `PIN must be 4-6 digits!`
    }
  },
  
  password: {
    type: String,
    required: function() {
      return (this.role === 'admin' || this.role === 'buyer') && this.registrationCompleted === true;
    },
    minlength: 6
  },
  
  // Location details (common for all)
  location: {
    address: { type: String, trim: true },
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Status and verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Registration tracking
  registrationStage: {
    type: Number,
    default: 0, // 0: basic info, 1: location, 2: role-specific, 3: complete
    min: 0,
    max: 3
  },
  
  registrationCompleted: {
    type: Boolean,
    default: false
  },
  
  // Activity tracking
  lastLogin: Date,
  
  // Account deletion
  deletedAt: Date,
  
  // Notification preferences (common)
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    ivr: { type: Boolean, default: function() { return this.role === 'farmer'; } }
  }
  
}, {
  timestamps: true
});

// Indexes for better query performance
baseUserSchema.index({ mobile: 1 });
baseUserSchema.index({ role: 1 });
baseUserSchema.index({ isActive: 1 });
baseUserSchema.index({ 'location.district': 1 });

// Virtual to get role-specific profile
baseUserSchema.virtual('profile', {
  ref: function() {
    if (this.role === 'farmer') return 'Farmer';
    if (this.role === 'buyer') return 'Buyer';
    if (this.role === 'admin') return 'Admin';
    return null;
  },
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Use existing model if already compiled, otherwise create new one
module.exports = mongoose.models.BaseUser || mongoose.model('BaseUser', baseUserSchema);
