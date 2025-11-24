// Test script to validate all registration improvements
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testRegistrationValidation() {
  console.log('🧪 Testing Enhanced Registration Validation...\n');
  
  // Test 1: Invalid mobile (with alphabets)
  console.log('Test 1: Mobile with alphabets');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '98abc43210',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but got:', response.status);
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', error.response?.data?.errors?.[0]?.message || error.response?.data?.message);
  }
  
  // Test 2: Mobile too short
  console.log('\nTest 2: Mobile too short');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '98765',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but got:', response.status);
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', error.response?.data?.errors?.[0]?.message || error.response?.data?.message);
  }
  
  // Test 3: Mobile too long
  console.log('\nTest 3: Mobile too long');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '987654321012',
      name: 'Test User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but got:', response.status);
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', error.response?.data?.errors?.[0]?.message || error.response?.data?.message);
  }
  
  // Test 4: Name with numbers/symbols
  console.log('\nTest 4: Name with numbers/symbols');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '9876543210',
      name: 'Test123@#$',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but got:', response.status);
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', error.response?.data?.errors?.[0]?.message || error.response?.data?.message);
  }
  
  // Test 5: Existing mobile number (use the one from DB)
  console.log('\nTest 5: Existing mobile number');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      mobile: '9234098765', // This exists in DB
      name: 'Another User',
      role: 'farmer'
    });
    console.log('❌ SHOULD HAVE FAILED - but got:', response.status);
  } catch (error) {
    console.log('✅ CORRECTLY FAILED:', error.response?.data?.message);
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
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ UNEXPECTED FAILURE:', error.response?.data);
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

module.exports = { testRegistrationValidation };