import api from './api';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expiresAt: string;
    role: string;
  };
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: any;
}

export interface CheckMobileResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    role: string;
    name: string;
  };
}

class ForgotPasswordService {
  // EmailJS Public Key from environment or fallback
  private static EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'dG-gYAGp-kDSQCM9X';

  /**
   * Check if mobile number exists in the system
   */
  static async checkMobile(mobile: string): Promise<CheckMobileResponse> {
    try {
      const response = await api.post('/auth/check-mobile', { mobile });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  /**
   * Request OTP for forgot password
   */
  static async requestOTP(mobile: string): Promise<ForgotPasswordResponse> {
    try {
      console.log('📧 Requesting OTP for mobile:', mobile);
      
      const response = await api.post('/auth/forgot-password', {
        mobile,
        emailJSPublicKey: this.EMAILJS_PUBLIC_KEY
      });
      
      console.log('✅ OTP request response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ OTP request failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  /**
   * Verify OTP and login user
   */
  static async verifyOTP(mobile: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🔐 Verifying OTP for mobile:', mobile);
      
      const response = await api.post('/auth/verify-otp', {
        mobile,
        otp
      });
      
      console.log('✅ OTP verification successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ OTP verification failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  /**
   * Format mobile number for display
   */
  static formatMobile(mobile: string): string {
    return `+91-${mobile.slice(0, 2)}***${mobile.slice(-2)}`;
  }

  /**
   * Format email for display
   */
  static formatEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }

  /**
   * Validate mobile number format
   */
  static validateMobile(mobile: string): boolean {
    return /^[0-9]{10}$/.test(mobile);
  }

  /**
   * Validate OTP format
   */
  static validateOTP(otp: string): boolean {
    return /^[0-9]{6}$/.test(otp);
  }
}

export default ForgotPasswordService;