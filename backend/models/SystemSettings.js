const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['enabled', 'disabled'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: ''
  }
}, { _id: true });

const systemSettingsSchema = new mongoose.Schema({
  // Maintenance Mode
  isOperational: {
    type: Boolean,
    default: true, // true = operational, false = maintenance
    required: true
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please try again later.'
  },
  currentMaintenanceStart: {
    type: Date,
    default: null
  },
  
  // Maintenance History Logs
  maintenanceLogs: [maintenanceLogSchema],
  
  // Email Settings
  emailSettings: {
    enabled: { type: Boolean, default: false },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: 'Uthra Platform' }
  },
  
  // SMS Settings
  smsSettings: {
    enabled: { type: Boolean, default: true },
    provider: { type: String, default: 'twilio' },
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    senderId: { type: String, default: '' }
  },
  
  // Notification Preferences
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    notifyAdminOnNewUser: { type: Boolean, default: true },
    notifyAdminOnNewRequest: { type: Boolean, default: true },
    notifyAdminOnSystemError: { type: Boolean, default: true }
  },
  
  // User Management Settings
  userSettings: {
    autoVerifyUsers: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: false },
    requirePhoneVerification: { type: Boolean, default: true },
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    lockoutDuration: { type: Number, default: 30 } // minutes
  },
  
  // Session Settings
  sessionSettings: {
    sessionTimeout: { type: Number, default: 60, min: 15, max: 480 }, // minutes
    maxConcurrentSessions: { type: Number, default: 3, min: 1, max: 10 },
    rememberMeDuration: { type: Number, default: 30 } // days
  },
  
  // Security Settings
  securitySettings: {
    passwordMinLength: { type: Number, default: 6, min: 6, max: 20 },
    passwordRequireUppercase: { type: Boolean, default: false },
    passwordRequireNumbers: { type: Boolean, default: false },
    passwordRequireSpecialChars: { type: Boolean, default: false },
    passwordExpiryDays: { type: Number, default: 0 }, // 0 = never expires
    enableTwoFactor: { type: Boolean, default: false }
  },
  
  // API Settings
  apiSettings: {
    rateLimit: { type: Number, default: 100 }, // requests per minute
    enableApiKeys: { type: Boolean, default: false },
    allowedOrigins: [{ type: String }]
  },
  
  // Backup Settings
  backupSettings: {
    autoBackup: { type: Boolean, default: false },
    backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    backupTime: { type: String, default: '02:00' }, // HH:MM format
    retentionDays: { type: Number, default: 30 }
  },
  
  // Last Updated Info
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'systemsettings'
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Method to toggle maintenance mode
systemSettingsSchema.methods.toggleMaintenance = function(isOperational, adminId, reason = '') {
  const now = new Date();
  
  this.isOperational = isOperational;
  
  if (!isOperational) {
    // Enabling maintenance mode
    this.currentMaintenanceStart = now;
    this.maintenanceLogs.push({
      status: 'enabled',
      startTime: now,
      endTime: null,
      updatedBy: adminId,
      reason: reason
    });
  } else {
    // Disabling maintenance mode (back to operational)
    if (this.maintenanceLogs.length > 0) {
      const lastLog = this.maintenanceLogs[this.maintenanceLogs.length - 1];
      if (!lastLog.endTime) {
        lastLog.endTime = now;
      }
    }
    this.currentMaintenanceStart = null;
  }
  
  this.lastUpdatedBy = adminId;
  this.lastUpdatedAt = now;
  
  return this.save();
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
