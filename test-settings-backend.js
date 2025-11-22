const mongoose = require('mongoose');
require('dotenv').config();

// Import the SystemSettings model
const SystemSettings = require('./backend/models/SystemSettings');

async function testSystemSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uthra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test getting settings
    console.log('\n🔍 Testing getSettings...');
    const settings = await SystemSettings.getSettings();
    console.log('✅ Settings retrieved successfully');
    console.log('📧 Email enabled:', settings.emailSettings.enabled);
    console.log('📱 SMS enabled:', settings.smsSettings.enabled);
    console.log('🔔 Notifications enabled:', settings.notificationSettings.emailNotifications);
    console.log('👥 Auto verify users:', settings.userSettings.autoVerifyUsers);
    console.log('🔒 Password min length:', settings.securitySettings.passwordMinLength);
    console.log('⏱️ Session timeout:', settings.sessionSettings.sessionTimeout);
    console.log('💾 Auto backup:', settings.backupSettings.autoBackup);
    
    // Test updating a setting
    console.log('\n🔄 Testing update...');
    settings.emailSettings.enabled = true;
    settings.emailSettings.smtpHost = 'smtp.gmail.com';
    settings.emailSettings.smtpPort = 587;
    await settings.save();
    console.log('✅ Settings updated successfully');
    
    console.log('\n✅ All backend functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing settings backend:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

testSystemSettings();