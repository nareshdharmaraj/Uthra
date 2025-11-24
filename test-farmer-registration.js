// Test script to verify farmer registration with conditional validation
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFarmerRegistrationStep1() {
  console.log('🧪 Testing Farmer Registration Step 1...');
  
  try {
    const testData = {
      mobile: '9856543210', // Valid Indian mobile number
      name: 'Subash Kumar',
      role: 'farmer'
    };
    
    console.log('📤 Sending registration data:', testData);
    
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, testData);
    
    console.log('✅ Registration Step 1 SUCCESS!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user) {
      console.log('👤 Created User ID:', response.data.user.id || response.data.user._id);
      console.log('📱 Mobile:', response.data.user.mobile);
      console.log('👨‍🌾 Role:', response.data.user.role);
      console.log('🔢 Registration Stage:', response.data.user.registrationStage);
    }
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Registration Step 1 FAILED!');
    console.log('📊 Error Status:', error.response?.status);
    console.log('📋 Error Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.errors) {
      console.log('🔍 Validation Errors:');
      error.response.data.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.field || 'Unknown field'}: ${err.message}`);
      });
    }
    
    throw error;
  }
}

async function runTest() {
  try {
    await testFarmerRegistrationStep1();
    console.log('\n🎉 All tests passed! Farmer registration step 1 is working correctly.');
  } catch (error) {
    console.log('\n💥 Test failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runTest();
}

module.exports = { testFarmerRegistrationStep1 };