/**
 * EmailJS Credential Verification and Testing Tool
 */

const axios = require('axios');

class EmailJSVerifier {
  static SERVICE_ID = 'service_ybp8ac6';
  static TEMPLATE_ID = 'template_jjedi25';
  static PUBLIC_KEY = 'dG-gYAGp-kDSQCM9X';
  static EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

  static async testCredentials() {
    console.log('🔍 EMAILJS CREDENTIAL VERIFICATION');
    console.log('=' .repeat(50));
    console.log(`Service ID: ${this.SERVICE_ID}`);
    console.log(`Template ID: ${this.TEMPLATE_ID}`);
    console.log(`Public Key: ${this.PUBLIC_KEY}`);
    console.log(`Endpoint: ${this.EMAILJS_ENDPOINT}`);
    console.log('');

    // Test 1: Basic connection test
    console.log('📡 Test 1: Testing EmailJS API connection...');
    try {
      const testPayload = {
        service_id: this.SERVICE_ID,
        template_id: this.TEMPLATE_ID,
        user_id: this.PUBLIC_KEY,
        template_params: {
          passcode: '123456',
          time: '25 Nov 2025, 02:30 pm',
          email: 'test@example.com'
        }
      };

      console.log('📤 Sending test payload:');
      console.log(JSON.stringify(testPayload, null, 2));

      const response = await axios.post(this.EMAILJS_ENDPOINT, testPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
        validateStatus: () => true // Don't throw on HTTP errors
      });

      console.log(`📥 Response Status: ${response.status}`);
      console.log(`📥 Response Data:`, response.data);

      if (response.status === 200) {
        console.log('✅ SUCCESS: EmailJS credentials are working!');
        return true;
      } else if (response.status === 404) {
        console.log('❌ FAILURE: Account/Service/Template not found');
        this.printTroubleshootingSteps();
        return false;
      } else {
        console.log(`❌ FAILURE: HTTP ${response.status} - ${response.data}`);
        return false;
      }
    } catch (error) {
      console.log('❌ NETWORK ERROR:', error.message);
      return false;
    }
  }

  static printTroubleshootingSteps() {
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('=' .repeat(50));
    console.log('1. Login to EmailJS Dashboard (https://dashboard.emailjs.com/)');
    console.log('2. Verify your account is active and not suspended');
    console.log('3. Check Services section:');
    console.log(`   - Look for service with ID: ${this.SERVICE_ID}`);
    console.log('   - If not found, create a new service or copy the correct ID');
    console.log('4. Check Templates section:');
    console.log(`   - Look for template with ID: ${this.TEMPLATE_ID}`);
    console.log('   - Verify template contains these variables: {{passcode}}, {{time}}, {{email}}');
    console.log('5. Check Account section:');
    console.log(`   - Verify Public Key matches: ${this.PUBLIC_KEY}`);
    console.log('   - If different, copy the correct public key');
    console.log('');
    console.log('📋 Template Structure Required:');
    console.log('   Subject: Your OTP for Uthra Platform');
    console.log('   Body: Hello, your OTP is {{passcode}}. Valid until {{time}}.');
    console.log('   To: {{email}}');
  }

  static generateCurlCommand() {
    const payload = {
      service_id: this.SERVICE_ID,
      template_id: this.TEMPLATE_ID,
      user_id: this.PUBLIC_KEY,
      template_params: {
        passcode: '123456',
        time: '25 Nov 2025, 02:30 pm',
        email: 'your-email@example.com'
      }
    };

    console.log('');
    console.log('🔗 TEST WITH CURL:');
    console.log('=' .repeat(50));
    console.log('curl -X POST https://api.emailjs.com/api/v1.0/email/send \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log(`  -d '${JSON.stringify(payload)}'`);
  }
}

// Run the verification
(async () => {
  const success = await EmailJSVerifier.testCredentials();
  
  if (!success) {
    EmailJSVerifier.generateCurlCommand();
    
    console.log('');
    console.log('🚨 ACTION REQUIRED:');
    console.log('1. Fix EmailJS credentials in dashboard');
    console.log('2. Update backend/services/emailService.js with correct values');
    console.log('3. Restart server and test again');
  }
})();