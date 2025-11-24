require('dotenv').config();
const mongoose = require('mongoose');

// Test that simulates the exact API call that's failing
const testProfileAPI = async () => {
  try {
    console.log('🔍 STEP 1: Testing Farmer Model Import and Query');
    console.log('=============================================');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Database connected');
    
    // Test the exact same code that the API uses
    const Farmer = require('./backend/models/Farmer');
    console.log('✅ Farmer model imported successfully');
    
    // Simulate the API call
    const userId = '6923fa6bd38c7fd5193d9e2a';
    console.log(`🔍 Testing: Farmer.findById('${userId}').select('-password -pin')`);
    
    const farmer = await Farmer.findById(userId).select('-password -pin');
    
    if (!farmer) {
      console.log('❌ No farmer found with that ID');
      process.exit(1);
    }
    
    console.log('✅ Farmer found successfully!');
    console.log('\n📊 Profile API Response Preview:');
    console.log('================================');
    console.log(JSON.stringify({
      success: true,
      data: farmer
    }, null, 2));
    
    console.log('\n🎯 Expected Frontend Display After Fix:');
    console.log('=======================================');
    console.log(`Farm Size: ${farmer.farmSize} acres`);
    console.log(`Primary Crops: ${farmer.crops ? farmer.crops.join(', ') : 'No crops'}`);
    console.log(`Bank Name: ${farmer.bankDetails?.bankName || 'Not provided'}`);
    console.log(`Account Number: ${farmer.bankDetails?.accountNumber || 'Not provided'}`);
    console.log(`IFSC Code: ${farmer.bankDetails?.ifscCode || 'Not provided'}`);
    console.log(`Branch Name: ${farmer.bankDetails?.branchName || 'Not provided'}`);
    
    console.log('\n✅ ALL TESTS PASSED - Profile API should work after backend restart!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testProfileAPI();