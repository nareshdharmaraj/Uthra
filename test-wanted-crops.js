const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testWantedCrops() {
  try {
    console.log('🔐 Step 1: Logging in as buyer...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      mobile: '9876543211',
      password: 'buyer123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');

    console.log('\n📋 Step 2: Adding wanted crop...');
    const wantedCropData = {
      cropName: 'Tomato',
      category: 'vegetables',
      requiredQuantity: 2,
      unit: 'kg',
      budgetPerUnit: 20,
      frequency: 'one-time',
      districts: ['Karur'],
      qualityPreference: 'any',
      notes: 'Need fresh tomatoes',
      active: true
    };

    const addResponse = await axios.post(
      `${API_BASE_URL}/buyers/wanted-crops`,
      wantedCropData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Wanted crop added successfully!');
    console.log('Response:', JSON.stringify(addResponse.data, null, 2));

    console.log('\n📋 Step 3: Fetching wanted crops...');
    const getResponse = await axios.get(`${API_BASE_URL}/buyers/wanted-crops`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Wanted crops fetched successfully!');
    console.log('Total:', getResponse.data.total);
    console.log('Data:', JSON.stringify(getResponse.data.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\n⚠️  403 Forbidden - Authorization issue');
      console.log('This suggests the role check is failing');
    }
  }
}

testWantedCrops();
