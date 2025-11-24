// Buyer collection - stores ALL buyer data (auth + business details)
const { mongoose } = require('../backend/config/database');

const buyerSchema = new mongoose.Schema({
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
      message: props => `${props.value} is not a valid 10-digit mobile number! Must be exactly 10 digits.`
    }
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  
  role: {
    type: String,
    default: 'buyer',
    immutable: true
  },
  
  password: {
    type: String,
    required: function() {
      return this.registrationCompleted;
    }
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
    default: 0,
    min: 0,
    max: 3
  },
  
  registrationCompleted: {
    type: Boolean,
    default: false
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Buyer type
  buyerType: {
    type: String,
    enum: ['individual', 'company'],
    required: function() {
      return this.registrationStage >= 2;
    }
  },
  
  // Company reference (if buyer is part of a company they joined)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Business information
  businessName: { 
    type: String, 
    required: function() {
      // Required only after step 1 registration
      return this.registrationStage >= 2;
    },
    trim: true 
  },
  
  // Company-specific fields (only for buyerType === 'company')
  companyName: {
    type: String,
    trim: true,
    required: function() {
      return this.buyerType === 'company';
    }
  },
  
  companyRegistrationNumber: {
    type: String,
    trim: true
  },
  
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'restaurant', 'exporter', 'processor', 'individual'],
    required: function() {
      return this.registrationStage >= 2;
    }
  },
  
  organizationName: { type: String, trim: true },
  organizationDescription: { type: String, trim: true },
  yearEstablished: { type: Number },
  
  // Tax and legal
  gstNumber: { 
    type: String, 
    trim: true,
    uppercase: true
  },
  panNumber: { 
    type: String, 
    trim: true,
    uppercase: true
  },
  
  website: { type: String, trim: true },
  
  // Preferences
  preferredCategories: [{ 
    type: String 
  }],
  
  // Wanted crops - what they're actively looking to buy
  wantedCrops: [{
    cropName: { type: String, trim: true, required: true },
    category: { type: String, trim: true },
    requiredQuantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'ton', 'quintal'], default: 'kg' },
    budgetPerUnit: { type: Number },
    frequency: { 
      type: String, 
      enum: ['one-time', 'weekly', 'monthly', 'seasonal'],
      default: 'one-time'
    },
    districts: [{ type: String }],
    qualityPreference: { 
      type: String, 
      enum: ['organic', 'conventional', 'any'], 
      default: 'any' 
    },
    notes: { type: String },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
  }],
  
  // Delivery and logistics
  deliveryCapabilities: {
    hasOwnTransport: { type: Boolean, default: false },
    maxDeliveryRadius: { type: Number }, // in km
    preferredPickupLocations: [{ type: String }],
    canProvideTransport: { type: Boolean, default: false }
  },
  
  // Payment terms
  paymentTerms: {
    preferredMethod: { 
      type: String, 
      enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'mixed'],
      default: 'bank_transfer'
    },
    advancePayment: { type: Boolean, default: false },
    advancePercentage: { type: Number, min: 0, max: 100 },
    creditDays: { type: Number, default: 0 }
  },
  
  // Bank details
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String, uppercase: true },
    bankName: { type: String },
    accountHolderName: { type: String }
  },
  
  // Settings
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
      profileVisibility: { 
        type: String, 
        enum: ['public', 'verified', 'private'], 
        default: 'public' 
      },
      showContactInfo: { type: Boolean, default: true },
      allowFarmerContact: { type: Boolean, default: true },
      dataSharing: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' }
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDocuments: [{
    docType: String,
    docUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Stats
  stats: {
    totalRequests: { type: Number, default: 0 },
    activeRequests: { type: Number, default: 0 },
    completedDeals: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  deactivatedAt: Date,
  deactivationReason: String
  
}, {
  timestamps: true
});

// Indexes
buyerSchema.index({ mobile: 1 }, { unique: true });
buyerSchema.index({ buyerType: 1 });
buyerSchema.index({ isActive: 1 });
buyerSchema.index({ isVerified: 1 });
buyerSchema.index({ businessType: 1 });
buyerSchema.index({ 'wantedCrops.active': 1 });
buyerSchema.index({ 'location.district': 1 });

// Virtual for requests
buyerSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'buyer'
});

module.exports = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);
