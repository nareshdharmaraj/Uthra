import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordStep from './ForgotPasswordStep';
import OTPVerificationStep from './OTPVerificationStep';
import './ForgotPassword.css';

type Step = 'forgot-password' | 'verify-otp';

interface UserData {
  email: string;
  role: string;
  expiresAt: string;
}

const ForgotPasswordFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('forgot-password');
  const [mobile, setMobile] = useState('');
  const [userData, setUserData] = useState<UserData>({
    email: '',
    role: '',
    expiresAt: ''
  });

  const navigate = useNavigate();

  const handleForgotPasswordNext = (mobileNumber: string, data: UserData) => {
    setMobile(mobileNumber);
    setUserData(data);
    setCurrentStep('verify-otp');
  };

  const handleBackToForgotPassword = () => {
    setCurrentStep('forgot-password');
    setMobile('');
    setUserData({ email: '', role: '', expiresAt: '' });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResend = () => {
    // Just for feedback, OTPVerificationStep handles the actual resend
    console.log('OTP resent successfully');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Header with logo and branding */}
        <div className="brand-header">
          <div className="logo">
            🌾 <span>Uthra</span>
          </div>
          <p className="tagline">Secure Account Recovery</p>
        </div>

        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className={`step ${currentStep === 'forgot-password' ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Mobile</span>
          </div>
          <div className="progress-line"></div>
          <div className={`step ${currentStep === 'verify-otp' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Verify OTP</span>
          </div>
        </div>

        {/* Step content */}
        <div className="step-content">
          {currentStep === 'forgot-password' && (
            <ForgotPasswordStep
              onNext={handleForgotPasswordNext}
              onBack={handleBackToLogin}
            />
          )}

          {currentStep === 'verify-otp' && (
            <OTPVerificationStep
              mobile={mobile}
              userData={userData}
              onBack={handleBackToForgotPassword}
              onResend={handleResend}
            />
          )}
        </div>

        {/* Footer */}
        <div className="forgot-password-footer">
          <p>
            Remember your password?{' '}
            <button
              type="button"
              className="link-button"
              onClick={handleBackToLogin}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordFlow;