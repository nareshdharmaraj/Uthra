// Test script to validate all registration improvements
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

function getErrorMessage(error) {
  return error.response?.data?.errors?.[0]?.msg || 
         error.response?.data?.errors?.[0]?.message || 
         error.response?.data?.message ||
         'Validation failed';
}

async function testRegistrationValidation() {
  console.log('🧪 Testing Enhanced Registration Validation...\n');
  
  // Test 1: Invalid mobile (with alphabets)
  console.log('Test 1: Mobile with alphabets');
  try {
    await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '98abc43210',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but succeeded');
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', getErrorMessage(error));
  }
  
  // Test 2: Mobile too short
  console.log('\nTest 2: Mobile too short');
  try {
    await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '98765',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but succeeded');
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', getErrorMessage(error));
  }
  
  // Test 3: Mobile too long
  console.log('\nTest 3: Mobile too long');
  try {
    await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '987654321012',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but succeeded');
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', getErrorMessage(error));
  }
  
  // Test 4: Name with numbers/symbols
  console.log('\nTest 4: Name with numbers/symbols');
  try {
    await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '9876543210',
      name: 'Test123@#$',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but succeeded');
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', getErrorMessage(error));
  }
  
  // Test 5: Existing mobile number (use the one from DB)
  console.log('\nTest 5: Existing mobile number');
  try {
    await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '9234098765', // This exists in DB
      name: 'Another User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but succeeded');
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', getErrorMessage(error));
  }
  
  // Test 6: Valid registration with any 10-digit number
  console.log('\nTest 6: Valid registration with any 10-digit number');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '1234567890', // Starts with 1, should work now
      name: 'Valid User',
      role: 'farmer'
    });
    console.log('✅ VALID REGISTRATION SUCCESS:', response.status);
    console.log('📋 User ID:', response.data.data.userId);
    console.log('📱 Mobile:', response.data.data.mobile);
  } catch (error) {
    console.log('❌ UNEXPECTED FAILURE:', getErrorMessage(error));
  }
  
  // Test 7: Another valid number starting with different digit
  console.log('\nTest 7: Valid registration starting with 0');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '0987654321',
      name: 'Zero User',
      role: 'farmer'
    });
    console.log('✅ VALID REGISTRATION SUCCESS:', response.status);
    console.log('📋 User ID:', response.data.data.userId);
    console.log('📱 Mobile:', response.data.data.mobile);
  } catch (error) {
    console.log('❌ UNEXPECTED FAILURE:', getErrorMessage(error));
  }
}

async function runTests() {
  try {
    await testRegistrationValidation();
    console.log('\n🎉 Validation tests completed!');
  } catch (error) {
    console.log('\n💥 Test suite failed:', error.message);
  }
}

if (require.main === module) {
  runTests();
}