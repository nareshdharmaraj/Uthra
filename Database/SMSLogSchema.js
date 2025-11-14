const { mongoose } = require('../Backend/config/database');

const smsLogSchema = new mongoose.Schema({
  // Sender and recipient
  from: {
    type: String,
    required: true
  },
  
  to: {
    type: String,
    required: true
  },
  
  // User references
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // SMS type
  messageType: {
    type: String,
    enum: [
      'notification',         // System notification
      'request_notification', // New request notification
      'status_update',        // Request status update
      'crop_alert',          // New crop available
      'price_update',        // Price change notification
      'conversation',        // Farmer-buyer chat
      'verification',        // OTP/verification
      'reminder',            // Reminder messages
      'marketing',           // Promotional messages
      'admin'                // Admin broadcasts
    ],
    default: 'notification'
  },
  
  // Direction
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'queued',
      'sending',
      'sent',
      'delivered',
      'failed',
      'undelivered',
      'rejected'
    ],
    default: 'queued'
  },
  
  // Provider details (Twilio/Gupshup)
  messageSid: {
    type: String,
    unique: true,
    sparse: true
  },
  
  provider: {
    type: String,
    enum: ['twilio', 'gupshup', 'other'],
    default: 'twilio'
  },
  
  // Timing
  sentAt: Date,
  deliveredAt: Date,
  
  // Related entities
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  
  relatedCallLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallLog'
  },
  
  // NLP processing for inbound SMS
  nlpProcessing: {
    processed: {
      type: Boolean,
      default: false
    },
    intent: {
      type: String,
      enum: [
        'accept_request',
        'reject_request',
        'counter_offer',
        'inquiry',
        'confirmation',
        'cancellation',
        'complaint',
        'general',
        'unknown'
      ]
    },
    confidence: Number,
    entities: [{
      type: {
        type: String,
        enum: ['crop', 'price', 'quantity', 'location', 'date', 'phone', 'other']
      },
      value: String,
      confidence: Number
    }],
    detectedAction: String,
    processedAt: Date
  },
  
  // Action taken based on SMS (for inbound)
  actionTaken: {
    type: String,
    enum: [
      'none',
      'request_accepted',
      'request_rejected',
      'counter_offer_created',
      'crop_updated',
      'forwarded_to_admin',
      'auto_replied'
    ],
    default: 'none'
  },
  
  autoReply: {
    sent: { type: Boolean, default: false },
    message: String,
    sentAt: Date
  },
  
  // Cost tracking
  cost: {
    type: Number,
    default: 0
  },
  
  segments: {
    type: Number,
    default: 1
  },
  
  // Error handling
  errorCode: String,
  errorMessage: String,
  
  // Retry information
  retryCount: {
    type: Number,
    default: 0
  },
  
  lastRetryAt: Date,
  
  // Template information (for outbound)
  templateUsed: String,
  templateVariables: mongoose.Schema.Types.Mixed,
  
  // Language
  language: {
    type: String,
    enum: ['english', 'tamil', 'hindi', 'telugu', 'kannada'],
    default: 'english'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Campaign tracking (for marketing)
  campaignId: String,
  campaignName: String,
  
  // User interaction
  userResponse: {
    responded: { type: Boolean, default: false },
    responseMessage: String,
    respondedAt: Date
  },
  
  // Admin notes
  notes: String,
  
  flagged: {
    type: Boolean,
    default: false
  },
  
  flagReason: String,
  
}, {
  timestamps: true
});

// Indexes
smsLogSchema.index({ from: 1 });
smsLogSchema.index({ to: 1 });
smsLogSchema.index({ sender: 1 });
smsLogSchema.index({ recipient: 1 });
smsLogSchema.index({ createdAt: -1 });
smsLogSchema.index({ status: 1 });
smsLogSchema.index({ messageType: 1 });
smsLogSchema.index({ messageSid: 1 });

// Compound indexes
smsLogSchema.index({ direction: 1, status: 1 });
smsLogSchema.index({ messageType: 1, createdAt: -1 });
smsLogSchema.index({ relatedRequest: 1, createdAt: -1 });

// Method to mark as sent
smsLogSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Method to mark as delivered
smsLogSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Method to mark as failed
smsLogSchema.methods.markAsFailed = function(errorCode, errorMessage) {
  this.status = 'failed';
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  return this.save();
};

module.exports = mongoose.models.SMSLog || mongoose.model('SMSLog', smsLogSchema);
