const { mongoose } = require('../Backend/config/database');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: [
      'new_request',
      'request_accepted',
      'request_rejected',
      'counter_offer',
      'new_crop',
      'crop_updated',
      'price_change',
      'payment_received',
      'payment_pending',
      'delivery_update',
      'rating_received',
      'system_alert',
      'account_update',
      'promotional'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Related entities
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  // Delivery channels
  channels: {
    web: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    ivr: { type: Boolean, default: false }
  },
  
  // Delivery status per channel
  deliveryStatus: {
    web: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      smsLogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SMSLog'
      }
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    ivr: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      callLogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CallLog'
      }
    }
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Action button
  actionRequired: {
    type: Boolean,
    default: false
  },
  
  actionButton: {
    text: String,
    link: String,
    action: String
  },
  
  // Additional data
  data: mongoose.Schema.Types.Mixed,
  
  // Expiry
  expiresAt: Date,
  
  // Scheduled delivery
  scheduledFor: Date,
  
  isSent: {
    type: Boolean,
    default: false
  },
  
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
