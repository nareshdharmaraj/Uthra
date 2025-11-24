require('dotenv').config();
const mongoose = require('mongoose');

// Test direct database access and API simulation
const testFarmerData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Import the models
    const Farmer = require('./backend/models/Farmer');
    
    // Test getting farmer like the API would
    console.log('\n🔍 Testing Farmer.findById...');
    const farmer = await Farmer.findById('6923fa6bd38c7fd5193d9e2a').select('-password -pin');
    
    if (!farmer) {
      console.log('❌ No farmer found with that ID');
    } else {
      console.log('✅ Farmer found:');
      console.log(JSON.stringify(farmer, null, 2));
      
      console.log('\n📊 Expected frontend display:');
      console.log(`Farm Size: ${farmer.farmSize} acres`);
      console.log(`Primary Crops: ${farmer.crops ? farmer.crops.join(', ') : 'None'}`);
      console.log(`Bank Name: ${farmer.bankDetails?.bankName || 'Not provided'}`);
      console.log(`Account Number: ${farmer.bankDetails?.accountNumber || 'Not provided'}`);
      console.log(`IFSC Code: ${farmer.bankDetails?.ifscCode || 'Not provided'}`);
      console.log(`Branch Name: ${farmer.bankDetails?.branchName || 'Not provided'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testFarmerData();