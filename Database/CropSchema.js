const { mongoose } = require('../backend/config/database');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // For NLP - storing alternate names/translations
  alternateNames: [{
    language: {
      type: String,
      enum: ['english', 'tamil', 'hindi', 'telugu', 'kannada']
    },
    name: String
  }],
  
  category: {
    type: String,
    enum: [
      'vegetables', 'fruits', 'grains', 'pulses', 'spices', 
      'oilseeds', 'cash_crops', 'dairy', 'other'
    ],
    required: true
  },
  
  variety: {
    type: String,
    trim: true
  },
  
  quantity: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter'],
      default: 'kg'
    }
  },
  
  availableQuantity: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter'],
      default: 'kg'
    }
  },
  
  price: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['per_kg', 'per_quintal', 'per_ton', 'per_piece', 'per_dozen', 'per_liter'],
      default: 'per_kg'
    }
  },
  
  quality: {
    type: String,
    enum: ['premium', 'grade_a', 'grade_b', 'standard', 'organic_certified'],
    default: 'standard'
  },
  
  // Availability period
  availableFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  availableTo: {
    type: Date,
    required: true
  },
  
  // Harvest information
  harvestDate: Date,
  
  // Storage and handling
  storageCondition: {
    type: String,
    enum: ['fresh', 'cold_storage', 'dry_storage', 'frozen']
  },
  
  // Location (can be different from farmer's registered location)
  pickupLocation: {
    address: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Images
  images: [{
    url: String,
    uploadedAt: Date
  }],
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Terms
  minimumOrderQuantity: {
    value: Number,
    unit: String
  },
  
  deliveryOptions: {
    farmerDelivery: { type: Boolean, default: false },
    buyerPickup: { type: Boolean, default: true },
    courierAvailable: { type: Boolean, default: false }
  },
  
  deliveryRadius: {
    type: Number, // in kilometers
    default: 0
  },
  
  paymentTerms: {
    type: String,
    enum: ['immediate', 'on_delivery', 'credit_7days', 'credit_15days', 'credit_30days'],
    default: 'immediate'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'sold_out', 'expired', 'removed'],
    default: 'active'
  },
  
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  
  requestCount: {
    type: Number,
    default: 0
  },
  
  // Entry method tracking
  entryMethod: {
    type: String,
    enum: ['web', 'ivr', 'sms', 'admin'],
    default: 'web'
  },
  
  // NLP confidence score (if entered via voice)
  nlpConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: Date,
  
}, {
  timestamps: true
});

// Indexes
cropSchema.index({ farmer: 1 });
cropSchema.index({ name: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ availableTo: 1 });
cropSchema.index({ 'pickupLocation.district': 1 });
cropSchema.index({ price: 1 });
cropSchema.index({ createdAt: -1 });

// Compound indexes for common queries
cropSchema.index({ status: 1, isVisible: 1, availableTo: 1 });
cropSchema.index({ category: 1, status: 1 });

// Virtual for active requests
cropSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'crop'
});

// Method to check if crop is still available
cropSchema.methods.isAvailable = function() {
  return this.status === 'active' && 
         this.availableQuantity.value > 0 && 
         new Date() <= this.availableTo;
};

// Method to update available quantity
cropSchema.methods.reduceQuantity = function(amount) {
  this.availableQuantity.value -= amount;
  if (this.availableQuantity.value <= 0) {
    this.status = 'sold_out';
    this.availableQuantity.value = 0;
  }
  return this.save();
};

module.exports = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
