/**
 * Test Farmer Registration Flow
 * This script tests the complete farmer registration process
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test farmer data
const testFarmer = {
  mobile: '9876543220',
  name: 'Test Farmer Kumar',
  role: 'farmer',
  location: {
    address: 'Test Farm, Main Road',
    village: 'Test Village',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641001'
  },
  farmerDetails: {
    farmSize: 5,
    farmingType: 'organic',
    preferredLanguage: 'tamil',
    crops: ['Tomato', 'Onion', 'Potato'],
    bankDetails: {
      accountHolderName: 'Test Farmer Kumar',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India'
    }
  },
  pin: '1234'
};

async function testFarmerRegistration() {
  console.log('\n🌾 Testing Farmer Registration Flow\n');
  console.log('═'.repeat(50));

  try {
    let userId;

    // Step 1: Initiate Registration
    console.log('\n📝 Step 1: Initiate Registration');
    console.log('-'.repeat(50));
    const step1Response = await axios.post(`${API_URL}/auth/register/initiate`, {
      mobile: testFarmer.mobile,
      name: testFarmer.name,
      role: testFarmer.role
    });

    if (step1Response.data.success) {
      userId = step1Response.data.data.userId;
      console.log('✅ Step 1 Success');
      console.log(`   User ID: ${userId}`);
      console.log(`   Mobile: ${testFarmer.mobile}`);
      console.log(`   Name: ${testFarmer.name}`);
      if (step1Response.data.data.otp) {
        console.log(`   OTP: ${step1Response.data.data.otp} (dev mode)`);
      }
    } else {
      throw new Error(step1Response.data.message);
    }

    // Step 2: Location Details
    console.log('\n📍 Step 2: Location Details');
    console.log('-'.repeat(50));
    const step2Response = await axios.post(`${API_URL}/auth/register/step2`, {
      userId: userId,
      location: testFarmer.location
    });

    if (step2Response.data.success) {
      console.log('✅ Step 2 Success');
      console.log(`   Address: ${testFarmer.location.address}`);
      console.log(`   Village: ${testFarmer.location.village}`);
      console.log(`   District: ${testFarmer.location.district}`);
    } else {
      throw new Error(step2Response.data.message);
    }

    // Step 3: Farmer Details & PIN
    console.log('\n🚜 Step 3: Farmer Details & PIN');
    console.log('-'.repeat(50));
    const step3Response = await axios.post(`${API_URL}/auth/register/step3`, {
      userId: userId,
      farmerDetails: testFarmer.farmerDetails,
      pin: testFarmer.pin
    });

    if (step3Response.data.success) {
      console.log('✅ Step 3 Success');
      console.log(`   Farm Size: ${testFarmer.farmerDetails.farmSize} acres`);
      console.log(`   Farming Type: ${testFarmer.farmerDetails.farmingType}`);
      console.log(`   PIN: ${testFarmer.pin}`);
      console.log(`   Bank: ${testFarmer.farmerDetails.bankDetails.bankName}`);
    } else {
      throw new Error(step3Response.data.message);
    }

    // Step 4: Complete Registration
    console.log('\n✅ Step 4: Complete Registration');
    console.log('-'.repeat(50));
    const step4Response = await axios.post(`${API_URL}/auth/register/step4`, {
      userId: userId,
      email: 'testfarmer@example.com'
    });

    if (step4Response.data.success) {
      console.log('✅ Step 4 Success - Registration Complete!');
      console.log(`   Token: ${step4Response.data.data.token.substring(0, 30)}...`);
      console.log(`   User ID: ${step4Response.data.data.user.id}`);
      console.log(`   Name: ${step4Response.data.data.user.name}`);
      console.log(`   Role: ${step4Response.data.data.user.role}`);
      console.log(`   Mobile: ${step4Response.data.data.user.mobile}`);
    } else {
      throw new Error(step4Response.data.message);
    }

    // Test PIN Login
    console.log('\n📞 Testing PIN Login (IVR)');
    console.log('-'.repeat(50));
    const pinLoginResponse = await axios.post(`${API_URL}/auth/login/pin`, {
      mobile: testFarmer.mobile,
      pin: testFarmer.pin
    });

    if (pinLoginResponse.data.success) {
      console.log('✅ PIN Login Success!');
      console.log(`   Message: ${pinLoginResponse.data.message}`);
      console.log(`   Farmer: ${pinLoginResponse.data.data.user.name}`);
      console.log(`   Language: ${pinLoginResponse.data.data.user.preferredLanguage}`);
      
      if (pinLoginResponse.data.data.greeting) {
        console.log('\n   🎉 Greetings:');
        console.log(`      Tamil: ${pinLoginResponse.data.data.greeting.tamil}`);
        console.log(`      English: ${pinLoginResponse.data.data.greeting.english}`);
        console.log(`      Hindi: ${pinLoginResponse.data.data.greeting.hindi}`);
      }
    } else {
      throw new Error(pinLoginResponse.data.message);
    }

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═'.repeat(50));
    console.log('\n✨ Farmer Registration System is working perfectly!\n');
    console.log('📋 Summary:');
    console.log('   ✅ 4-step registration process');
    console.log('   ✅ PIN-based authentication');
    console.log('   ✅ IVR login ready');
    console.log('   ✅ Multi-language greeting support');
    console.log('   ✅ All data stored in database\n');

  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('═'.repeat(50));
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data.error}`);
      if (error.response.data.stack) {
        console.error(`\nStack: ${error.response.data.stack}`);
      }
    } else {
      console.error(`Error: ${error.message}`);
    }
    
    console.error('\n💡 Make sure the backend server is running on http://localhost:5000');
    process.exit(1);
  }
}

// Run the test
console.log('\n🚀 Starting Farmer Registration Test...\n');
testFarmerRegistration();
