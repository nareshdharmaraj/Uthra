const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testFarmerSearch() {
  try {
    console.log('🔐 Step 1: Logging in as buyer...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      mobile: '9876543211',
      password: 'buyer123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');

    console.log('\n🔍 Step 2: Searching farmers without filters...');
    const searchAll = await axios.post(
      `${API_BASE_URL}/buyers/farmers/search`,
      {
        hasActiveCrops: false,
        page: 1,
        limit: 20
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Response:', JSON.stringify(searchAll.data, null, 2));

    console.log('\n🔍 Step 3: Searching by name "Naresh"...');
    const searchByName = await axios.post(
      `${API_BASE_URL}/buyers/farmers/search`,
      {
        searchTerm: 'Naresh',
        hasActiveCrops: false,
        page: 1,
        limit: 20
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Response:', JSON.stringify(searchByName.data, null, 2));

    console.log('\n🔍 Step 4: Searching by district "Namakkal"...');
    const searchByDistrict = await axios.post(
      `${API_BASE_URL}/buyers/farmers/search`,
      {
        district: 'Namakkal',
        hasActiveCrops: false,
        page: 1,
        limit: 20
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Response:', JSON.stringify(searchByDistrict.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFarmerSearch();
