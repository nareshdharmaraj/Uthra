/**
 * Test script to create a user without email and test the specific error message
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEmailMissingError() {
  console.log('🧪 Testing "No Email Registered" Error Message\n');

  // Test with different phone numbers to see if any exist without email
  const testNumbers = ['9876543211', '9876543212', '9876543213', '9876543214'];

  for (const mobile of testNumbers) {
    console.log(`Testing mobile: ${mobile}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/check-mobile`, {
        mobile: mobile
      });
      console.log(`✅ ${mobile} - Success:`, response.data.message);
      console.log(`   Email: ${response.data.data?.email}`);
      console.log(`   Role: ${response.data.data?.role}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${mobile} - Not registered:`, error.response.data.message);
      } else if (error.response?.status === 400) {
        console.log(`⚠️ ${mobile} - No email error:`, error.response.data.message);
        console.log('   Expected: "You did not register an email ID with this phone number"');
        console.log('   Actual:', error.response.data.message);
        console.log('   Match:', error.response.data.message === 'You did not register an email ID with this phone number' ? '✅' : '❌');
      } else {
        console.log(`❌ ${mobile} - Unexpected error:`, error.response?.data || error.message);
      }
    }
    console.log('');
  }

  console.log('🏁 Email testing completed!');
}

// Run the test
testEmailMissingError().catch(console.error);