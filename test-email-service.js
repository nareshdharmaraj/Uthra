const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const EmailService = require(path.join(__dirname, 'backend', 'services', 'emailService'));

async function testEmailService() {
  console.log('🧪 Testing Email Service with SMTP Fallback');
  console.log('='.repeat(50));
  
  // Test data
  const testEmail = 'nareshd2006@gmail.com';
  const testOTP = '123456';
  const testUser = 'Test User';
  const testExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  const publicKey = 'dG-gYAGp-kDSQCM9X';

  try {
    console.log('📧 Attempting to send OTP email...');
    console.log('   Email:', testEmail);
    console.log('   OTP:', testOTP);
    console.log('   User:', testUser);
    console.log('   Expiry:', testExpiry.toLocaleString());
    console.log('');

    const result = await EmailService.sendOTPEmail(
      testEmail, 
      testOTP, 
      testUser, 
      testExpiry, 
      publicKey
    );
    
    console.log('');
    console.log('📊 Test Result:');
    console.log('   Success:', result.success);
    if (result.method) console.log('   Method Used:', result.method);
    if (result.messageId) console.log('   Message ID:', result.messageId);
    if (result.message) console.log('   Message:', result.message);

    if (result.success) {
      console.log('');
      console.log('✅ SUCCESS: Email service is working properly!');
      console.log(`   Method used: ${result.method}`);
      if (result.method === 'SMTP') {
        console.log('   ✨ SMTP fallback successfully bypassed EmailJS restrictions');
      }
    } else {
      console.log('');
      console.log('❌ FAILURE: Email service failed');
      console.log('   Error:', result.message);
    }

  } catch (error) {
    console.error('');
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testEmailService();