// Test Database OTP Storage

const mongoose = require('mongoose');

// Connect to database
async function testDatabaseOTP() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://naresh:123456789@localhost:27017/Uthra?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Import models
    const Farmer = require('./Database/FarmerSchema');
    const Buyer = require('./Database/BuyerSchema');
    const Admin = require('./Database/AdminSchema');

    console.log('\n🔍 Testing OTP storage in database...');

    // Test 1: Find a user and add OTP
    console.log('\n📱 Test 1: Finding users...');
    
    // Find a farmer
    const farmer = await Farmer.findOne({ mobile: '9876543210' });
    if (farmer) {
      console.log('✅ Found farmer:', farmer.name, farmer.email);
      
      // Test OTP storage
      const testOTP = '123456';
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      farmer.otp = testOTP;
      farmer.otpExpiry = otpExpiry;
      await farmer.save();
      
      console.log('✅ OTP stored in farmer record');
      
      // Verify OTP retrieval
      const farmerWithOTP = await Farmer.findOne({ mobile: '9876543210' }).select('+otp +otpExpiry');
      console.log('✅ OTP retrieved:', farmerWithOTP.otp, 'expires at:', farmerWithOTP.otpExpiry);
      
      // Clean up
      farmer.otp = undefined;
      farmer.otpExpiry = undefined;
      await farmer.save();
      console.log('✅ OTP cleaned up');
    } else {
      console.log('❌ No farmer found with mobile 9876543210');
    }

    // Find a buyer
    const buyer = await Buyer.findOne();
    if (buyer) {
      console.log('✅ Found buyer:', buyer.name, buyer.email);
    } else {
      console.log('ℹ️ No buyer found');
    }

    // Find an admin
    const admin = await Admin.findOne();
    if (admin) {
      console.log('✅ Found admin:', admin.name, admin.email);
    } else {
      console.log('ℹ️ No admin found');
    }

    console.log('\n🎯 Database OTP functionality test completed!');
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDatabaseOTP();