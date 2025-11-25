import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../../features/auth/authSlice';
import ForgotPasswordService from '../../../services/forgotPasswordService';
import './ForgotPassword.css';
import { AppDispatch } from '../../../store';

interface OTPVerificationStepProps {
  mobile: string;
  userData: {
    email: string;
    role: string;
    expiresAt: string;
  };
  onBack: () => void;
  onResend: () => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
  mobile,
  userData,
  onBack,
  onResend
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      const nextInput = document.getElementById(`otp-${nextIndex}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    } else {
      // Handle single character input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move to next field
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Get redirect URL based on user role and type
  const getRedirectUrl = (role: string, buyerType?: string) => {
    switch (role) {
      case 'farmer':
        return '/farmer/dashboard';
      case 'buyer':
        if (buyerType === 'company') {
          return '/company-buyer';
        }
        return '/individual-buyer';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const verifyResult = await ForgotPasswordService.verifyOTP(mobile, otpString);
      
      console.log('🔍 Full verification result:', verifyResult);
      console.log('🔍 Has success:', verifyResult.success);
      console.log('🔍 Has data:', !!verifyResult.data);
      console.log('🔍 Has token:', !!verifyResult.token);
      console.log('🔍 Message:', verifyResult.message);
      
      if (verifyResult.success && verifyResult.data) {
        setIsSuccess(true);
        setMessage('OTP verified successfully! Logging you in...');
        
        // Auto-login the user - backend returns token and user data directly
        const { token, data: user } = verifyResult;
        
        console.log('🎫 Extracted token:', !!token);
        console.log('👤 Extracted user:', user);
        
        // Validate that we have both token and user data
        if (!token) {
          console.error('❌ No token received');
          setError('Login failed: No authentication token received');
          setIsSuccess(false);
          return;
        }
        
        if (!user) {
          console.error('❌ No user data received');
          setError('Login failed: No user data received');
          setIsSuccess(false);
          return;
        }
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('explicitLogin', 'true');
        
        console.log('💾 Data stored in localStorage');
        
        // Dispatch login action
        dispatch(login.fulfilled({ token, user }, '', { mobile: mobile, password: '' }));
        
        console.log('📡 Login action dispatched');
        
        // Get redirect URL based on user role
        const redirectUrl = getRedirectUrl(user.role, user.buyerType);
        
        console.log('🚀 Redirecting to:', redirectUrl);
        
        setTimeout(() => {
          console.log('🏁 Starting navigation to:', redirectUrl);
          navigate(redirectUrl);
        }, 1500);
      } else if (verifyResult.success && !verifyResult.data) {
        console.error('❌ Success but no data - this might be wrong response format');
        setError('Login successful but no user data received');
      } else {
        console.error('❌ Verification failed:', verifyResult.message);
        setError(verifyResult.message || 'Invalid OTP');
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setError('');
    
    try {
      await onResend();
      setTimeLeft(900);
      setMessage('OTP sent successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP');
      setCanResend(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Success!</h2>
            <p>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-verification-step">
      <div className="step-header">
        <h2>Verify OTP</h2>
        <p className="subtitle">
          Enter the 6-digit code sent to your email<br />
          <strong>{userData.email}</strong>
        </p>
      </div>

      {/* Timer */}
      <div className="timer-section">
        <div className="timer">
          <span className={`time ${timeLeft < 300 ? 'timer-warning' : ''}`}>
            Time remaining: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* OTP Input Form */}
      <form onSubmit={handleSubmit} className="otp-form">
        <div className="otp-input-group">
          <label>Enter 6-digit OTP</label>
          <p className="otp-instructions">Fill in the blanks below</p>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`otp-digit ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="_"
                autoComplete="off"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="success-message-text">
            {message}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={loading}
          >
            Back
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>

        {/* Resend OTP */}
        <div className="resend-section">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="resend-button"
            >
              Resend OTP
            </button>
          ) : (
            <span className="resend-disabled">
              Resend OTP in {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default OTPVerificationStep;