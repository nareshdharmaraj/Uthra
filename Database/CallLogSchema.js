const { mongoose } = require('../Backend/config/database');

const callLogSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Call details
  callSid: {
    type: String, // Twilio/Exotel call ID
    unique: true,
    sparse: true
  },
  
  phoneNumber: {
    type: String,
    required: true
  },
  
  callType: {
    type: String,
    enum: ['inbound', 'outbound', 'automated'],
    required: true
  },
  
  callPurpose: {
    type: String,
    enum: [
      'farmer_login',
      'new_crop_entry',
      'crop_management',
      'view_requests',
      'request_response',
      'talk_to_agent',
      'general_inquiry',
      'notification'
    ]
  },
  
  // Call timing
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endTime: Date,
  
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // Call status
  callStatus: {
    type: String,
    enum: [
      'initiated',
      'ringing',
      'in_progress',
      'completed',
      'busy',
      'no_answer',
      'failed',
      'cancelled'
    ],
    default: 'initiated'
  },
  
  // Authentication
  authenticationStatus: {
    type: String,
    enum: ['not_attempted', 'success', 'failed', 'skipped'],
    default: 'not_attempted'
  },
  
  pinEntered: {
    type: Boolean,
    default: false
  },
  
  // IVR navigation
  menuPath: [{
    menu: String,
    option: String,
    timestamp: Date
  }],
  
  // Actions performed during call
  actionsPerformed: [{
    action: {
      type: String,
      enum: [
        'login',
        'crop_added',
        'crop_updated',
        'crop_removed',
        'request_viewed',
        'request_accepted',
        'request_rejected',
        'counter_offer_made',
        'agent_connected',
        'information_provided'
      ]
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Related entities
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  
  // Voice recognition data
  voiceInputs: [{
    input: String,
    recognizedText: String,
    confidence: Number,
    language: String,
    timestamp: Date
  }],
  
  // NLP processing
  nlpProcessing: [{
    input: String,
    intent: String,
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }],
    cropDetected: String,
    confidence: Number,
    timestamp: Date
  }],
  
  // DTMF inputs (keypad presses)
  dtmfInputs: [{
    key: String,
    timestamp: Date
  }],
  
  // Call recording
  recordingUrl: String,
  recordingDuration: Number,
  
  // Human agent involvement
  agentAssisted: {
    type: Boolean,
    default: false
  },
  
  agentDetails: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    agentName: String,
    connectedAt: Date,
    disconnectedAt: Date,
    notes: String
  },
  
  // Call quality metrics
  callQuality: {
    audioQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
      default: 'unknown'
    },
    connectionIssues: Boolean,
    dropped: Boolean
  },
  
  // Errors and issues
  errors: [{
    errorCode: String,
    errorMessage: String,
    timestamp: Date
  }],
  
  // Cost tracking
  callCost: {
    type: Number,
    default: 0
  },
  
  // Feedback
  farmerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  
  // Notes
  systemNotes: String,
  adminNotes: String,
  
  // Retry information (for automated calls)
  isRetry: {
    type: Boolean,
    default: false
  },
  
  retryAttempt: {
    type: Number,
    default: 0
  },
  
  originalCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallLog'
  },
  
}, {
  timestamps: true
});

// Indexes
callLogSchema.index({ farmer: 1 });
callLogSchema.index({ startTime: -1 });
callLogSchema.index({ callStatus: 1 });
callLogSchema.index({ callPurpose: 1 });
callLogSchema.index({ relatedRequest: 1 });
callLogSchema.index({ callSid: 1 });

// Compound indexes
callLogSchema.index({ farmer: 1, startTime: -1 });
callLogSchema.index({ callStatus: 1, startTime: -1 });

// Method to calculate duration on call end
callLogSchema.methods.endCall = function(endStatus = 'completed') {
  this.endTime = new Date();
  this.callStatus = endStatus;
  if (this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  return this.save();
};

// Method to add action
callLogSchema.methods.addAction = function(action, details = {}) {
  this.actionsPerformed.push({
    action,
    details,
    timestamp: new Date()
  });
  return this.save();
};

module.exports = mongoose.models.CallLog || mongoose.model('CallLog', callLogSchema);
