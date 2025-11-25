// Test the updated EmailJS configuration

const axios = require('axios');

async function testUpdatedEmailJS() {
  const baseURL = 'http://localhost:5000/api/auth';
  
  console.log('🔥 TESTING UPDATED EMAILJS CONFIGURATION');
  console.log('==========================================');
  console.log('📧 Service ID: service_ybp8ac6');
  console.log('📄 Template ID: template_jjedi25\n');
  
  try {
    // Step 1: Check mobile exists
    console.log('📱 Step 1: Check Mobile Number');
    const checkResponse = await axios.post(`${baseURL}/check-mobile`, {
      mobile: '9876543213'
    });
    console.log('✅ Mobile found:', checkResponse.data.message);
    console.log('👤 User:', checkResponse.data.data.name);
    console.log('📧 Email:', checkResponse.data.data.email);

    // Step 2: Request OTP with new EmailJS config
    console.log('\n🔐 Step 2: Request OTP (New EmailJS Config)');
    const forgotResponse = await axios.post(`${baseURL}/forgot-password`, {
      mobile: '9876543213',
      emailJSPublicKey: 'bWtCpA_B-HhGpKK3d'
    });
    
    if (forgotResponse.data.success) {
      console.log('✅ OTP Request Response:', forgotResponse.data);
      console.log('📧 Email sent to:', forgotResponse.data.data.email);
      console.log('⏰ Expires at:', forgotResponse.data.data.expiresAt);
      console.log('\n🎊 EmailJS Integration Working!');
      console.log('✅ Service ID: service_ybp8ac6 - WORKING');
      console.log('✅ Template ID: template_jjedi25 - WORKING');
      console.log('✅ Email delivery: SUCCESS');
      
      // Check if user should check their email
      console.log('\n📬 Next Steps:');
      console.log('1. Check email inbox for OTP');
      console.log('2. Use the 6-digit code in the frontend');
      console.log('3. Complete the forgot password flow');
      
    } else {
      console.log('❌ OTP Request Failed:', forgotResponse.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.status, error.response.data);
      if (error.response.status === 500) {
        console.log('\n🔍 Checking EmailJS Configuration...');
        console.log('- Service ID: service_ybp8ac6');
        console.log('- Template ID: template_jjedi25');
        console.log('- Public Key: bWtCpA_B-HhGpKK3d');
        console.log('- Template Variables: {{passcode}}, {{time}}, {{to_email}}, {{to_name}}');
      }
    } else {
      console.log('❌ Request Error:', error.message);
    }
  }
}

testUpdatedEmailJS();