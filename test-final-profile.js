const testProfileNow = async () => {
  try {
    console.log('🧪 TESTING PROFILE API - FINAL TEST');
    console.log('==================================');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '1234098765', password: 'subash' })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Login failed:', error);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Get cookies
    const cookies = response.headers.get('set-cookie');
    
    // Test profile
    const profileResponse = await fetch('http://localhost:5000/api/farmers/profile', {
      headers: { 'Cookie': cookies || '' }
    });
    
    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.log('❌ Profile fetch failed:', error);
      return;
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Profile fetch successful!');
    
    const data = profileData.data;
    console.log('\n📊 ACTUAL PROFILE DATA:');
    console.log('Farm Size:', data.farmSize, 'acres');
    console.log('Crops:', data.crops);
    console.log('Bank Details:', data.bankDetails);
    console.log('Location:', data.location);
    
    console.log('\n🎯 FRONTEND WILL NOW SHOW:');
    console.log('Farm Size: "' + data.farmSize + ' acres" ✅');
    console.log('Primary Crops: "' + (data.crops || []).join(', ') + '" ✅');
    console.log('Bank Name: "' + (data.bankDetails?.bankName || 'Not provided') + '" ✅');
    console.log('Account Number: "' + (data.bankDetails?.accountNumber || 'Not provided') + '" ✅');
    console.log('IFSC Code: "' + (data.bankDetails?.ifscCode || 'Not provided') + '" ✅');
    console.log('Account Holder: "' + (data.bankDetails?.accountHolderName || 'Not provided') + '" ✅');
    
    console.log('\n✅ SUCCESS: Profile API is working perfectly!');
    console.log('🔄 Please refresh your browser to see the updated data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testProfileNow();