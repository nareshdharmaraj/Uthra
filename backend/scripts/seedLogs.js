const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const CallLog = require('../models/CallLog');
const SMSLog = require('../models/SMSLog');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/BuyerModel');
const connectDB = require('../config/database');

// Connect to MongoDB
connectDB();

const seedLogs = async () => {
  try {
    console.log('Starting log seeding...');

    // Get some existing users
    const farmers = await Farmer.find().limit(5).select('_id mobile');
    const buyers = await Buyer.find().limit(3).select('_id mobile');

    if (farmers.length === 0 || buyers.length === 0) {
      console.log('No farmers or buyers found. Please create some users first.');
      return;
    }

    console.log(`Found ${farmers.length} farmers and ${buyers.length} buyers`);

    // Generate Call Logs
    const callLogs = [];
    const callTypes = ['inbound', 'outbound', 'automated'];
    const callStatuses = ['completed', 'failed', 'no_answer', 'busy', 'cancelled'];
    const callPurposes = ['farmer_login', 'new_crop_entry', 'crop_management', 'view_requests', 'general_inquiry'];

    for (let i = 0; i < 20; i++) {
      const user = farmers[Math.floor(Math.random() * farmers.length)];
      
      const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
      const callStatus = callStatuses[Math.floor(Math.random() * callStatuses.length)];
      const callPurpose = callPurposes[Math.floor(Math.random() * callPurposes.length)];
      const duration = callStatus === 'completed' ? Math.floor(Math.random() * 600) + 30 : 0;

      // Random timestamp within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - daysAgo);
      startTime.setHours(startTime.getHours() - hoursAgo);
      
      const endTime = new Date(startTime);
      endTime.setSeconds(endTime.getSeconds() + duration);

      callLogs.push({
        farmer: user._id,
        phoneNumber: user.mobile,
        callType,
        callPurpose,
        callStatus,
        duration,
        startTime,
        endTime: callStatus === 'completed' ? endTime : undefined,
        callSid: `CA${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        ivrFlowData: {
          languageSelected: Math.random() > 0.5 ? 'tamil' : 'english',
          menuPath: [callPurpose]
        }
      });
    }

    // Generate SMS Logs
    const smsLogs = [];
    const messageTypes = ['notification', 'request_notification', 'status_update', 'crop_alert', 'verification'];
    const smsStatuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];

    for (let i = 0; i < 20; i++) {
      const user = farmers[Math.floor(Math.random() * farmers.length)];
      
      const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      const status = smsStatuses[Math.floor(Math.random() * smsStatuses.length)];

      // Random timestamp within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const sentAt = new Date();
      sentAt.setDate(sentAt.getDate() - daysAgo);
      sentAt.setHours(sentAt.getHours() - hoursAgo);

      const messages = {
        verification: `Your verification code is ${Math.floor(100000 + Math.random() * 900000)}`,
        notification: 'New crop listing matches your interests. Check the app now!',
        request_notification: 'You have received a new request from a buyer.',
        status_update: 'Your request status has been updated.',
        crop_alert: 'Your crop listing has received a new inquiry from a buyer.'
      };

      smsLogs.push({
        from: '+91' + '9876543210',
        to: user.mobile,
        recipient: user._id,
        message: messages[messageType],
        messageType,
        direction: 'outbound',
        status,
        provider: 'twilio',
        messageSid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        sentAt,
        deliveredAt: status === 'delivered' ? new Date(sentAt.getTime() + 5000) : undefined,
        cost: status === 'sent' || status === 'delivered' ? parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)) : 0
      });
    }

    // Clear existing logs
    console.log('Clearing existing logs...');
    await CallLog.deleteMany({});
    await SMSLog.deleteMany({});

    // Insert new logs
    console.log('Inserting call logs...');
    const insertedCalls = await CallLog.insertMany(callLogs);
    console.log(`✓ Created ${insertedCalls.length} call logs`);

    console.log('Inserting SMS logs...');
    const insertedSMS = await SMSLog.insertMany(smsLogs);
    console.log(`✓ Created ${insertedSMS.length} SMS logs`);

    // Activity logs are generated automatically by the system
    console.log('\n✓ Log seeding completed successfully!');
    console.log(`  - ${insertedCalls.length} call logs`);
    console.log(`  - ${insertedSMS.length} SMS logs`);
    console.log('  - Activity logs are generated from user actions');

  } catch (error) {
    console.error('Error seeding logs:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedLogs();
