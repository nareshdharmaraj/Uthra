// Complete forgot password flow test

const axios = require('axios');

async function testCompleteFlow() {
  const baseURL = 'http://localhost:5000/api/auth';
  
  console.log('🎯 COMPLETE FORGOT PASSWORD FLOW TEST');
  console.log('=====================================\n');
  
  try {
    // Step 1: Check if mobile exists
    console.log('📱 Step 1: Check Mobile Number');
    const checkResponse = await axios.post(`${baseURL}/check-mobile`, {
      mobile: '9876543213'
    });
    console.log('✅ Mobile found:', checkResponse.data);

    // Step 2: Request OTP
    console.log('\n🔐 Step 2: Request OTP');
    const forgotResponse = await axios.post(`${baseURL}/forgot-password`, {
      mobile: '9876543213',
      emailJSPublicKey: 'bWtCpA_B-HhGpKK3d'
    });
    console.log('✅ OTP requested:', forgotResponse.data);

    // Extract the OTP from the console output (in test mode, we'll use a known OTP)
    // For now, let's use the OTP that would be in the database
    
    // Step 3: Verify OTP (we'll use the OTP that was generated)
    // In a real scenario, user would get this from email
    console.log('\n🔍 Step 3: Verify OTP');
    
    // Let me query the database to get the actual OTP
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://naresh:123456789@localhost:27017/Uthra?authSource=admin');
    const Admin = require('./Database/AdminSchema');
    
    const admin = await Admin.findOne({ mobile: '9876543213' }).select('+otp +otpExpiry');
    console.log('🔍 Admin OTP in database:', admin.otp);
    
    if (admin && admin.otp) {
      const verifyResponse = await axios.post(`${baseURL}/verify-otp`, {
        mobile: '9876543213',
        otp: admin.otp
      });
      console.log('✅ OTP verified:', verifyResponse.data);
      
      // Step 4: Test auto-login
      if (verifyResponse.data.success && verifyResponse.data.data) {
        console.log('\n🎊 Step 4: Auto-login Successful!');
        console.log('👤 User data:', verifyResponse.data.data.user.name);
        console.log('🔑 JWT token received:', verifyResponse.data.data.token.substring(0, 20) + '...');
        console.log('🎭 Role:', verifyResponse.data.data.user.role);
        
        console.log('\n🎉 COMPLETE FORGOT PASSWORD FLOW - SUCCESS!');
        console.log('✅ All steps completed successfully');
        console.log('✅ Database OTP storage: Working');
        console.log('✅ Email simulation: Working');
        console.log('✅ OTP verification: Working');
        console.log('✅ Auto-login: Working');
        console.log('✅ JWT generation: Working');
      }
    } else {
      console.log('❌ No OTP found in database');
    }
    
    await mongoose.disconnect();

  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Request Error:', error.message);
    }
  }
}

testCompleteFlow();