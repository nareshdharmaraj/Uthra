const axios = require('axios');

class RecaptchaService {
  static SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
  static SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
  static PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
  static PROJECT_NUMBER = process.env.GOOGLE_CLOUD_PROJECT_NUMBER;
  static VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

  /**
   * Verify reCAPTCHA Enterprise token from client
   * @param {string} token - reCAPTCHA response token
   * @param {string} remoteip - Client IP address (optional)
   * @param {string} expectedAction - Expected action (for Enterprise)
   * @returns {Promise<object>} - Verification result
   */
  static async verifyToken(token, remoteip = null, expectedAction = 'login') {
    try {
      if (!token) {
        return {
          success: false,
          message: 'reCAPTCHA token is required'
        };
      }

      if (!this.SECRET_KEY) {
        console.error('❌ RECAPTCHA_SECRET_KEY not configured');
        return {
          success: false,
          message: 'reCAPTCHA service not configured'
        };
      }

      console.log('🔒 Verifying reCAPTCHA Enterprise token...');
      console.log('   Expected Action:', expectedAction);
      console.log('   Project ID:', this.PROJECT_ID);
      console.log('   Project Number:', this.PROJECT_NUMBER);

      const params = new URLSearchParams({
        secret: this.SECRET_KEY,
        response: token
      });

      if (remoteip) {
        params.append('remoteip', remoteip);
      }

      const response = await axios.post(this.VERIFY_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      const result = response.data;
      
      console.log('🔍 reCAPTCHA Enterprise verification result:', {
        success: result.success,
        score: result.score,
        action: result.action,
        hostname: result.hostname,
        challenge_ts: result.challenge_ts
      });

      if (result.success) {
        // For Enterprise, check action and score
        if (result.action && result.action !== expectedAction) {
          console.log(`❌ Action mismatch. Expected: ${expectedAction}, Got: ${result.action}`);
          return {
            success: false,
            message: 'Action verification failed'
          };
        }

        // For Enterprise, check minimum score (0.5 is recommended threshold)
        if (result.score !== undefined && result.score < 0.5) {
          console.log(`❌ Low reCAPTCHA score: ${result.score}`);
          return {
            success: false,
            message: 'reCAPTCHA score too low',
            score: result.score
          };
        }

        console.log('✅ reCAPTCHA Enterprise verification successful');
        return {
          success: true,
          score: result.score,
          action: result.action,
          hostname: result.hostname
        };
      } else {
        console.log('❌ reCAPTCHA Enterprise verification failed:', result['error-codes']);
        return {
          success: false,
          message: 'reCAPTCHA verification failed',
          errorCodes: result['error-codes']
        };
      }

    } catch (error) {
      console.error('💥 reCAPTCHA Enterprise verification error:', error.message);
      return {
        success: false,
        message: 'reCAPTCHA service error'
      };
    }
  }

  /**
   * Middleware to verify reCAPTCHA for protected routes
   */
  static async middleware(req, res, next) {
    try {
      const { recaptchaToken } = req.body;
      
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification required'
        });
      }

      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const verification = await RecaptchaService.verifyToken(recaptchaToken, clientIP, 'login');

      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: verification.message || 'reCAPTCHA verification failed'
        });
      }

      // Store verification result in request for further use
      req.recaptchaVerified = true;
      req.recaptchaScore = verification.score;
      
      next();
    } catch (error) {
      console.error('reCAPTCHA middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'reCAPTCHA verification error'
      });
    }
  }
}

module.exports = RecaptchaService;