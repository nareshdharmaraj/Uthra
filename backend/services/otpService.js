const crypto = require('crypto');

class OTPService {
  /**
   * Generate a 6-digit numeric OTP
   * @returns {string} - 6 digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate OTP expiry time (15 minutes from now)
   * @returns {Date} - Expiry time
   */
  static generateOTPExpiry() {
    const now = new Date();
    return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
  }

  /**
   * Format the expiry time for email template
   * @param {Date} expiryTime - The expiry time
   * @returns {string} - Formatted time string
   */
  static formatExpiryTime(expiryTime) {
    return expiryTime.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Check if OTP is valid and not expired
   * @param {string} otp - OTP to validate
   * @param {string} storedOTP - OTP stored in database
   * @param {Date} otpExpiry - OTP expiry time from database
   * @returns {boolean} - Whether OTP is valid
   */
  static validateOTP(otp, storedOTP, otpExpiry) {
    if (!otp || !storedOTP || !otpExpiry) {
      return false;
    }

    // Check if OTP matches
    if (otp !== storedOTP) {
      return false;
    }

    // Check if OTP is not expired
    const now = new Date();
    if (now > otpExpiry) {
      return false;
    }

    return true;
  }

  /**
   * Clear OTP data (call after successful verification)
   * @returns {object} - Update object to clear OTP fields
   */
  static clearOTPData() {
    return {
      $unset: {
        otp: 1,
        otpExpiry: 1
      }
    };
  }
}

module.exports = OTPService;