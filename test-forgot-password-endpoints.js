// Test forgot password endpoints

const axios = require('axios');

async function testForgotPasswordEndpoints() {
  const baseURL = 'http://localhost:5000/api/auth';
  
  console.log('🔥 TESTING FORGOT PASSWORD ENDPOINTS');
  console.log('=====================================\n');
  
  try {
    // Test 1: Check if endpoint exists
    console.log('📡 Test 1: Check endpoint availability');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', healthResponse.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  try {
    // Test 2: Test check-mobile endpoint with invalid mobile
    console.log('\n📡 Test 2: Check mobile endpoint (should return 404 for non-existent)');
    const checkResponse = await axios.post(`${baseURL}/check-mobile`, {
      mobile: '9999999999'
    });
    console.log('📱 Check mobile response:', checkResponse.status, checkResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('📱 Expected error for non-existent mobile:', error.response.status, error.response.data);
    } else {
      console.log('❌ Check mobile error:', error.message);
    }
  }
  
  try {
    // Test 3: Test with a real mobile number (assuming farmer exists)
    console.log('\n📡 Test 3: Check with real farmer mobile number');
    const checkResponse = await axios.post(`${baseURL}/check-mobile`, {
      mobile: '9876543210'
    });
    console.log('✅ Found user:', checkResponse.status, checkResponse.data);
    
    // Test 4: Request OTP for found user
    console.log('\n📡 Test 4: Request OTP');
    const otpResponse = await axios.post(`${baseURL}/forgot-password`, {
      mobile: '9876543210'
    });
    console.log('📧 OTP requested:', otpResponse.status, otpResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('📱 Response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Request error:', error.message);
    }
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testForgotPasswordEndpoints();