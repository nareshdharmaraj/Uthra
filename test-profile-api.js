require('dotenv').config();

const testProfile = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  
  try {
    // First login to get session
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: '1234098765',
        password: 'subash'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Extract cookie from response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test get profile
    console.log('\n📱 Getting profile...');
    const profileResponse = await fetch(`${BASE_URL}/farmers/profile`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Profile data received:');
    console.log(JSON.stringify(profileData, null, 2));
    
    // Check specific fields that should show data
    const data = profileData.data;
    console.log('\n🔍 Key fields:');
    console.log(`Farm Size: ${data.farmSize || 'NOT SET'}`);
    console.log(`Crops: ${JSON.stringify(data.crops || 'NOT SET')}`);
    console.log(`Bank Details: ${JSON.stringify(data.bankDetails || 'NOT SET')}`);
    console.log(`Location: ${JSON.stringify(data.location || 'NOT SET')}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProfile();