// Use the connected mongoose instance from database config
const { mongoose } = require('../Backend/config/database');

const userSchema = new mongoose.Schema({
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
  
  // Buyer Type
  buyerType: {
    type: String,
    enum: ['individual', 'company'],
    required: function() {
      return this.role === 'buyer';
    }
  },
  
  // Company Reference (if buyer is part of a company)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Authentication
  pin: {
    type: String,
    required: function() {
      // PIN required only for farmers after registration complete
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
      // Password required for buyers/admins after registration complete
      return (this.role === 'admin' || this.role === 'buyer') && this.registrationCompleted === true;
    },
    minlength: 6
  },
  
  // Location details
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
  
  // Farmer-specific fields
  farmerDetails: {
    farmSize: { type: Number }, // in acres
    farmingType: { 
      type: String, 
      enum: ['organic', 'conventional', 'mixed', 'other']
    },
    preferredLanguage: {
      type: String,
      enum: ['english', 'tamil', 'hindi', 'telugu', 'kannada'],
      default: 'tamil'
    },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String }
    },
    idProof: {
      type: { type: String, enum: ['aadhar', 'pan', 'voter', 'driving_license'] },
      number: { type: String }
    }
  },
  
  // Buyer-specific fields
  buyerDetails: {
    businessName: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ['retailer', 'wholesaler', 'restaurant', 'exporter', 'processor', 'individual']
    },
    organizationName: { type: String, trim: true },
    organizationDescription: { type: String, trim: true },
    yearEstablished: { type: Number },
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    website: { type: String, trim: true },
    preferredCategories: [{ type: String }], // Types of crops they usually buy
    wantedCrops: [{
      cropName: { type: String, trim: true },
      category: { type: String, trim: true },
      requiredQuantity: { type: Number },
      unit: { type: String, enum: ['kg', 'ton', 'quintal'], default: 'kg' },
      budgetPerUnit: { type: Number },
      frequency: { type: String, enum: ['one-time', 'weekly', 'monthly', 'seasonal'] },
      districts: [{ type: String }], // Preferred sourcing districts
      qualityPreference: { type: String, enum: ['organic', 'conventional', 'any'], default: 'any' },
      notes: { type: String },
      active: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],
    deliveryCapabilities: {
      hasOwnTransport: { type: Boolean, default: false },
      maxDeliveryRadius: { type: Number }, // in km
      preferredPickupLocations: [{ type: String }]
    },
    paymentTerms: {
      preferredMethod: { 
        type: String, 
        enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'mixed'],
        default: 'bank_transfer'
      },
      advancePayment: { type: Boolean, default: false },
      creditDays: { type: Number, default: 0 }
    },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String }
    },
    settings: {
      notifications: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
        ivrCalls: { type: Boolean, default: false },
        newCropAlerts: { type: Boolean, default: true },
        priceChangeAlerts: { type: Boolean, default: true },
        requestUpdates: { type: Boolean, default: true },
        promotionalMessages: { type: Boolean, default: false }
      },
      privacy: {
        profileVisibility: { type: String, enum: ['public', 'verified', 'private'], default: 'public' },
        showContactInfo: { type: Boolean, default: true },
        allowFarmerContact: { type: Boolean, default: true },
        dataSharing: { type: Boolean, default: false }
      },
      language: { type: String, default: 'en' }
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
  
  // Registration stage tracking (for multi-step registration)
  registrationStage: {
    type: Number,
    default: 0, // 0: basic info, 1: location, 2: role-specific, 3: verification, 4: complete
    min: 0,
    max: 4
  },
  
  registrationCompleted: {
    type: Boolean,
    default: false
  },
  
  // Activity tracking
  lastLogin: Date,
  lastIVRCall: Date,
  totalIVRCalls: {
    type: Number,
    default: 0
  },
  
  // Account deletion
  deletedAt: Date,
  
  // Preferences
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    ivr: { type: Boolean, default: true }
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
userSchema.index({ mobile: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.district': 1 });
userSchema.index({ isActive: 1 });

// Virtual field for crops (for farmers)
userSchema.virtual('crops', {
  ref: 'Crop',
  localField: '_id',
  foreignField: 'farmer'
});

// Virtual field for requests (for buyers)
userSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'buyer'
});

// Use existing model if already compiled, otherwise create new one
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
