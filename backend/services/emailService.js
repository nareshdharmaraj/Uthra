const axios = require('axios');
const nodemailer = require('nodemailer');

class EmailService {
  // EmailJS credentials from environment variables
  static SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_ybp8ac6';
  static TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_jjedi25';
  static PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'dG-gYAGp-kDSQCM9X';
  static EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

  // Debug environment variables on class initialization
  static {
    console.log('🔧 EmailService Environment Check:');
    console.log('   EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID || 'not set - using fallback');
    console.log('   EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID || 'not set - using fallback');
    console.log('   EMAILJS_PUBLIC_KEY:', process.env.EMAILJS_PUBLIC_KEY || 'not set - using fallback');
    console.log('   Final SERVICE_ID:', this.SERVICE_ID);
    console.log('   Final TEMPLATE_ID:', this.TEMPLATE_ID);
    console.log('   Final PUBLIC_KEY:', this.PUBLIC_KEY);
  }

  /**
   * Create SMTP transporter for fallback email sending
   */
  static createSMTPTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ SMTP credentials not configured');
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Send OTP email via SMTP (fallback method)
   */
  static async sendOTPViaSMTP(email, otp, userName, expiryTime) {
    try {
      const transporter = this.createSMTPTransporter();
      
      if (!transporter) {
        return {
          success: false,
          message: 'SMTP not configured - cannot send email'
        };
      }

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'Uthra Platform'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your OTP for Uthra Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); color: white; border-radius: 10px 10px 0 0;">
              <h1>🌾 Uthra Platform</h1>
              <p style="margin: 0; opacity: 0.9;">Your OTP Code</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName || 'User'},</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">You requested to reset your password. Use the following OTP to continue:</p>
              
              <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #4CAF50;">
                <h1 style="color: #2E7D32; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px;">⏰ <strong>Valid until:</strong> ${expiryTime.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this OTP, please ignore this email or contact support.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message from Uthra Platform. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      console.log('📧 Sending OTP via SMTP to:', email);
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ SMTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('❌ SMTP email failed:', error.message);
      return {
        success: false,
        message: `SMTP error: ${error.message}`
      };
    }
  }
  
  /**
   * Test EmailJS configuration
   * @param {string} publicKey - EmailJS public key
   * @returns {Promise<boolean>} - Configuration validity
   */
  static async testConfiguration(publicKey) {
    try {
      console.log('🧪 Testing EmailJS configuration...');
      
      // Try to send a test email with minimal data
      const testData = {
        service_id: this.SERVICE_ID,
        template_id: this.TEMPLATE_ID,
        user_id: publicKey,
        template_params: {
          passcode: '123456',
          time: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          email: 'test@example.com'
        }
      };
      
      // This will fail but give us information about the service
      const response = await axios.post(this.EMAILJS_ENDPOINT, testData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: () => true // Don't throw on HTTP errors
      });
      
      console.log('📊 EmailJS test response:', response.status, response.data);
      return response.status === 200;
      
    } catch (error) {
      console.log('❌ EmailJS configuration test failed:', error.message);
      return false;
    }
  }

  /**
   * Send OTP email using EmailJS with SMTP fallback
   * @param {string} email - Recipient email
   * @param {string} otp - 6 digit OTP
   * @param {string} userName - User's name
   * @param {Date} expiryTime - OTP expiry time
   * @param {string} publicKey - EmailJS public key
   * @returns {Promise<object>} - Success status with details
   */
  static async sendOTPEmail(email, otp, userName, expiryTime, publicKey) {
    // Try EmailJS first
    try {
      const formattedTime = expiryTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const emailData = {
        service_id: this.SERVICE_ID,
        template_id: this.TEMPLATE_ID,
        user_id: publicKey,
        template_params: {
          passcode: otp,
          time: formattedTime,
          email: email
        }
      };

      console.log('📧 Attempting EmailJS first...');
      console.log('📧 Sending OTP email to:', email);
      console.log('🔐 OTP:', otp);
      console.log('⏰ Valid until:', formattedTime);
      console.log('📝 Template data:', JSON.stringify(emailData, null, 2));

      const response = await axios.post(this.EMAILJS_ENDPOINT, emailData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (response.status === 200) {
        console.log('✅ EmailJS: OTP email sent successfully');
        return { success: true, method: 'EmailJS' };
      } else {
        console.error('❌ EmailJS response error:', response.status, response.data);
        throw new Error(`EmailJS error: ${response.status}`);
      }
    } catch (emailJSError) {
      console.error('❌ EmailJS failed:', emailJSError.message);
      
      // Check for specific EmailJS errors
      if (emailJSError.response) {
        console.error('EmailJS Error Response:', emailJSError.response.data);
        console.error('EmailJS Error Status:', emailJSError.response.status);
        
        if (emailJSError.response.status === 403) {
          console.log('🔄 EmailJS blocked (403) - falling back to SMTP...');
        } else if (emailJSError.response.status === 404) {
          console.log('🔄 EmailJS account/template not found (404) - falling back to SMTP...');
        }
      }
      
      // Fallback to SMTP
      console.log('🔄 Attempting SMTP fallback...');
      const smtpResult = await this.sendOTPViaSMTP(email, otp, userName, expiryTime);
      
      if (smtpResult.success) {
        console.log('✅ SMTP fallback successful');
        return { success: true, method: 'SMTP', messageId: smtpResult.messageId };
      } else {
        console.error('❌ Both EmailJS and SMTP failed');
        return {
          success: false,
          message: `Email delivery failed. EmailJS: ${emailJSError.message}, SMTP: ${smtpResult.message}`
        };
      }
    }
  }

  /**
   * Get template information
   * @returns {string} - Template info
   */
  static getTemplateStructure() {
    return 'EmailJS Template Variables: {{to_email}}, {{to_name}}, {{passcode}}, {{time}}, {{from_name}}';
  }
}

module.exports = EmailService;