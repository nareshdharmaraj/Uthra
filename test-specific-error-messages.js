/**
 * Test script to verify specific error messages for forgot password
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSpecificErrors() {
  console.log('🧪 Testing Specific Error Messages for Forgot Password\n');

  // Test 1: Mobile number not registered
  console.log('Test 1: Testing unregistered mobile number...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/check-mobile`, {
      mobile: '0000000000'
    });
    console.log('❌ Expected error but got success:', response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correct error for unregistered mobile:', error.response.data.message);
      console.log('   Expected: "Mobile number not registered"');
      console.log('   Actual:', error.response.data.message);
      console.log('   Match:', error.response.data.message === 'Mobile number not registered' ? '✅' : '❌');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  console.log('');

  // Test 2: Test a registered mobile with email (should work)
  console.log('Test 2: Testing registered mobile with email...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/check-mobile`, {
      mobile: '9876543210'
    });
    console.log('✅ Success for registered mobile with email:', response.data.message);
    console.log('   User email (masked):', response.data.data?.email);
    console.log('   User role:', response.data.data?.role);
  } catch (error) {
    console.log('❌ Unexpected error for valid mobile:', error.response?.data || error.message);
  }
  console.log('');

  // Test 3: Test OTP request for unregistered mobile
  console.log('Test 3: Testing OTP request for unregistered mobile...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      mobile: '0000000000',
      emailJSPublicKey: 'bWtCpA_B-HhGpKK3d'
    });
    console.log('❌ Expected error but got success:', response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correct error for OTP request with unregistered mobile:', error.response.data.message);
      console.log('   Expected: "Mobile number not registered"');
      console.log('   Actual:', error.response.data.message);
      console.log('   Match:', error.response.data.message === 'Mobile number not registered' ? '✅' : '❌');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  console.log('');

  // Test 4: Test validation errors
  console.log('Test 4: Testing invalid mobile number format...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/check-mobile`, {
      mobile: '123' // Invalid format
    });
    console.log('❌ Expected validation error but got success:', response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correct validation error:', error.response.data.message);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  console.log('');

  console.log('🏁 Test completed! Check the results above to verify error messages are working correctly.');
}

// Run the test
testSpecificErrors().catch(console.error);