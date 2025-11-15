// Farmer collection - stores ALL farmer data (auth + farm details)
const { mongoose } = require('../Backend/config/database');

const farmerSchema = new mongoose.Schema({
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
    sparse: true,
    lowercase: true,
    trim: true
  },
  
  role: {
    type: String,
    default: 'farmer',
    immutable: true
  },
  
  pin: {
    type: String,
    required: function() {
      return this.registrationCompleted;
    }
  },
  
  password: String,
  
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
  
  // Farm information
  farmSize: {
    type: Number,
    required: true // in acres
  },
  
  farmingType: { 
    type: String, 
    enum: ['organic', 'conventional', 'mixed', 'other'],
    required: true
  },
  
  crops: [{
    type: String,
    trim: true
  }],
  
  preferredLanguage: {
    type: String,
    enum: ['english', 'tamil', 'hindi', 'telugu', 'kannada'],
    default: 'tamil'
  },
  
  // Bank details for payments
  bankDetails: {
    accountNumber: { 
      type: String,
      required: true
    },
    ifscCode: { 
      type: String,
      required: true,
      uppercase: true
    },
    bankName: { 
      type: String,
      required: true
    },
    accountHolderName: { 
      type: String,
      required: true
    }
  },
  
  // ID Proof
  idProof: {
    type: { 
      type: String, 
      enum: ['aadhar', 'pan', 'voter', 'driving_license']
    },
    number: { type: String }
  },
  
  // Verification status
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
    totalCropsListed: { type: Number, default: 0 },
    activeCrops: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    completedDeals: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Activity tracking
  lastIVRCall: Date,
  totalIVRCalls: {
    type: Number,
    default: 0
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
farmerSchema.index({ mobile: 1 }, { unique: true });
farmerSchema.index({ isActive: 1 });
farmerSchema.index({ isVerified: 1 });
farmerSchema.index({ farmingType: 1 });
farmerSchema.index({ 'location.district': 1 });

// Virtual for crops
farmerSchema.virtual('cropListings', {
  ref: 'Crop',
  localField: '_id',
  foreignField: 'farmer'
});

// IVR tracking fields
farmerSchema.add({
  lastIVRCall: Date,
  totalIVRCalls: { type: Number, default: 0 }
});

module.exports = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);
