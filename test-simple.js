// Simple test for valid registration
const axios = require('axios');

async function testValid() {
  try {
    console.log('Testing valid registration...');
    const response = await axios.post('http://localhost:5000/api/auth/register/initiate', {
      mobile: '1234567890',
      name: 'Valid User',
      role: 'farmer'
    });
    console.log('✅ SUCCESS:', response.status, response.data);
  } catch (error) {
    console.log('❌ FAILED:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testValid();