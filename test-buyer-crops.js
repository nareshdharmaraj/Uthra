const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testBuyerCrops() {
  try {
    console.log('🔐 Step 1: Logging in as buyer...');
    
    // Using the buyer credentials from the user's message
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      mobile: '9876543211',
      password: 'buyer123'
    });

    console.log('✅ Login successful!');
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      console.error('❌ No token in response');
      return;
    }
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n🌾 Step 2: Fetching crops as buyer...');
    const cropsResponse = await axios.get(`${API_BASE_URL}/buyers/crops`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Response status:', cropsResponse.status);
    console.log('Response data:', JSON.stringify(cropsResponse.data, null, 2));

    if (cropsResponse.data.data && cropsResponse.data.data.length > 0) {
      console.log('\n✅ SUCCESS: Crops are being fetched correctly!');
      console.log('Total crops found:', cropsResponse.data.total);
      console.log('Crops returned:', cropsResponse.data.count);
    } else {
      console.log('\n⚠️  No crops returned in response!');
      console.log('This is unexpected since we know there\'s 1 crop in the database.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication failed. Buyer credentials might be incorrect.');
      console.log('Please create a buyer account first or use correct credentials.');
    }
  }
}

testBuyerCrops();
