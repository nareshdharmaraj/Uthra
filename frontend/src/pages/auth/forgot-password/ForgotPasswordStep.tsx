import React, { useState } from 'react';
import ForgotPasswordService from '../../../services/forgotPasswordService';
import './ForgotPassword.css';

interface ForgotPasswordStepProps {
  onNext: (mobile: string, userData: any) => void;
  onBack: () => void;
}

const ForgotPasswordStep: React.FC<ForgotPasswordStepProps> = ({ onNext, onBack }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate mobile number
    if (!ForgotPasswordService.validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      // First check if mobile exists
      const checkResponse = await ForgotPasswordService.checkMobile(mobile);
      
      if (!checkResponse.success) {
        setError(checkResponse.message);
        return;
      }

      // Mobile exists, proceed to request OTP
      const otpResponse = await ForgotPasswordService.requestOTP(mobile);
      
      if (otpResponse.success) {
        onNext(mobile, {
          email: otpResponse.data?.email || '',
          role: otpResponse.data?.role || '',
          expiresAt: otpResponse.data?.expiresAt || ''
        });
      } else {
        setError(otpResponse.message);
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-step">
      <div className="step-header">
        <h2>Forgot Password</h2>
        <p>Enter your mobile number to receive an OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number</label>
          <div className="mobile-input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="text"
              id="mobile"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setMobile(value);
                }
              }}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
              disabled={loading}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="back-button"
            disabled={loading}
          >
            Back to Login
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || mobile.length !== 10}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      </form>

      <div className="help-text">
        <p>💡 You'll receive an OTP on your registered email address</p>
        <p>🔒 The OTP will be valid for 15 minutes</p>
      </div>
    </div>
  );
};

export default ForgotPasswordStep;