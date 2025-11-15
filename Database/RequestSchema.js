const { mongoose } = require('../backend/config/database');

const requestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  
  // Request details
  requestedQuantity: {
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
  
  offeredPrice: {
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
  
  // Negotiation history
  priceHistory: [{
    offeredBy: {
      type: String,
      enum: ['buyer', 'farmer']
    },
    price: {
      value: Number,
      unit: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery preferences
  preferredDeliveryDate: Date,
  
  deliveryMethod: {
    type: String,
    enum: ['farmer_delivery', 'buyer_pickup', 'courier', 'to_be_decided'],
    default: 'to_be_decided'
  },
  
  deliveryAddress: {
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
  
  // Request status
  status: {
    type: String,
    enum: [
      'pending',           // Buyer created request, waiting for farmer response
      'viewed',            // Farmer viewed the request
      'farmer_accepted',   // Farmer accepted the request
      'farmer_rejected',   // Farmer rejected the request
      'farmer_countered',  // Farmer offered different price
      'buyer_accepted',    // Buyer accepted farmer's counter
      'buyer_rejected',    // Buyer rejected farmer's counter
      'confirmed',         // Both parties agreed
      'in_transit',        // Order is being delivered
      'completed',         // Order delivered and confirmed
      'cancelled',         // Order cancelled
      'expired'            // Request expired without response
    ],
    default: 'pending'
  },
  
  // Status timeline for tracking
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  // Farmer's counter offer
  counterOffer: {
    price: {
      value: Number,
      unit: String
    },
    quantity: {
      value: Number,
      unit: String
    },
    note: String,
    offeredAt: Date
  },
  
  // Communication
  buyerNote: {
    type: String,
    maxlength: 500
  },
  
  farmerNote: {
    type: String,
    maxlength: 500
  },
  
  // IVR call tracking for this request
  ivrCallAttempts: {
    type: Number,
    default: 0
  },
  
  lastIVRCallTime: Date,
  
  nextIVRCallScheduled: Date,
  
  // SMS tracking
  smsNotificationsSent: [{
    to: String,
    message: String,
    sentAt: Date,
    status: String
  }],
  
  // Final agreement details (when confirmed)
  finalAgreement: {
    quantity: {
      value: Number,
      unit: String
    },
    price: {
      value: Number,
      unit: String
    },
    totalAmount: Number,
    deliveryDate: Date,
    deliveryMethod: String,
    paymentTerms: String,
    agreedAt: Date
  },
  
  // Payment tracking
  payment: {
    method: {
      type: String,
      enum: ['cash', 'online', 'bank_transfer', 'upi', 'cheque', 'pending']
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    paidAt: Date,
    transactionId: String
  },
  
  // Delivery tracking
  delivery: {
    status: {
      type: String,
      enum: ['not_started', 'picked_up', 'in_transit', 'delivered', 'failed']
    },
    pickedUpAt: Date,
    deliveredAt: Date,
    deliveryProof: String, // URL to image/document
    receivedBy: String
  },
  
  // Ratings and feedback (after completion)
  buyerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
  farmerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiry: 48 hours from creation
      return new Date(Date.now() + 48 * 60 * 60 * 1000);
    }
  },
  
  // Priority (for admin/system)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
}, {
  timestamps: true
});

// Indexes
requestSchema.index({ buyer: 1 });
requestSchema.index({ farmer: 1 });
requestSchema.index({ crop: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ expiresAt: 1 });

// Compound indexes
requestSchema.index({ farmer: 1, status: 1 });
requestSchema.index({ buyer: 1, status: 1 });
requestSchema.index({ status: 1, nextIVRCallScheduled: 1 });

// Method to check if request is still valid
requestSchema.methods.isValid = function() {
  return ['pending', 'viewed', 'farmer_countered', 'buyer_accepted'].includes(this.status) && 
         new Date() < this.expiresAt;
};

// Method to add status to history
requestSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  return this.save();
};

// Method to schedule next IVR call
requestSchema.methods.scheduleNextIVRCall = function() {
  if (this.ivrCallAttempts === 0) {
    // First retry: after 2 hours
    this.nextIVRCallScheduled = new Date(Date.now() + 2 * 60 * 60 * 1000);
  } else if (this.ivrCallAttempts < 5) {
    // Subsequent retries: twice the next day
    this.nextIVRCallScheduled = new Date(Date.now() + 12 * 60 * 60 * 1000);
  } else {
    // After 5 attempts, mark as expired
    this.status = 'expired';
    this.nextIVRCallScheduled = null;
  }
  return this.save();
};

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);
