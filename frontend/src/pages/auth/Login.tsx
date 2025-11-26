import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { login, clearError } from '../../features/auth/authSlice';
import { RootState } from '../../types';
import { AppDispatch } from '../../store';
import './Login.css';

// Extend Window interface for reCAPTCHA Enterprise (compatible interface)
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (element: string | HTMLElement, options: any) => number;
      execute: (siteKey: string, options?: { action: string }) => Promise<string>;
      reset: (widgetId?: number) => void;
    };
  }
}

interface LoginFormData {
  mobile: string;
  password?: string;
  pin?: string;
  recaptchaToken?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loginAttemptedRef = React.useRef(false);

  const { user, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // reCAPTCHA Enterprise configuration
  const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  // Debug environment variables and setup reCAPTCHA Enterprise
  useEffect(() => {
    console.log('🔍 reCAPTCHA Enterprise Debug:');
    console.log('   Site Key:', recaptchaSiteKey);
    console.log('   Window.grecaptcha:', typeof window.grecaptcha);
    console.log('   Ready function:', !!window.grecaptcha?.ready);
    console.log('   Script loaded:', !!(window as any).recaptchaLoaded);
    
    let isInitialized = false;
    
    // Enterprise-specific initialization
    const initializeRecaptcha = () => {
      if (isInitialized) {
        console.log('🔄 reCAPTCHA already initialized, skipping...');
        return;
      }
      
      if (!window.grecaptcha || !recaptchaSiteKey) {
        console.log('⚠️ grecaptcha or site key not available');
        return;
      }
      
      console.log('🚀 Initializing reCAPTCHA Enterprise...');
      isInitialized = true;
      
      try {
        // For Enterprise, directly try to render without waiting for ready
        const container = document.getElementById('recaptcha-container');
        if (container && !container.hasChildNodes()) {
          const widgetId = window.grecaptcha.render('recaptcha-container', {
            sitekey: recaptchaSiteKey,
            theme: 'light',
            size: 'normal',
            callback: (token: string) => {
              console.log('✅ reCAPTCHA Enterprise checkbox token:', token.substring(0, 20) + '...');
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA Enterprise expired');
            }
          });
          console.log('📝 reCAPTCHA Enterprise widget rendered with ID:', widgetId);
        }
      } catch (err) {
        console.warn('Failed to render Enterprise widget:', err);
        isInitialized = false; // Allow retry
      }
    };

    // Listen for the script ready event
    const handleRecaptchaReady = () => {
      console.log('📜 reCAPTCHA Enterprise ready event received');
      setTimeout(initializeRecaptcha, 100);
    };

    // Check if script is already loaded
    if ((window as any).recaptchaLoaded && window.grecaptcha) {
      console.log('📋 reCAPTCHA already loaded, initializing immediately');
      setTimeout(initializeRecaptcha, 100);
    }

    // Listen for script load event
    window.addEventListener('recaptchaReady', handleRecaptchaReady);
    
    return () => {
      window.removeEventListener('recaptchaReady', handleRecaptchaReady);
    };
  }, [recaptchaSiteKey]);

  // Security: Redirect authenticated users away from login
  useEffect(() => {
    if (isAuthenticated && user && !loginAttemptedRef.current) {
      toast.info('You are already logged in. Redirecting to dashboard...');
      setTimeout(() => {
        if (user.role === 'buyer') {
          if (user.buyerType === 'company') {
            navigate('/company-buyer');
          } else {
            navigate('/individual-buyer');
          }
        } else {
          navigate(`/${user.role}`);
        }
      }, 1500);
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Only navigate after a login attempt, not on initial page load
    if (isAuthenticated && user && loginAttemptedRef.current) {
      toast.success(`Welcome back, ${user.name}!`);
      
      // Route buyers to the appropriate dashboard based on buyerType
      if (user.role === 'buyer') {
        if (user.buyerType === 'company') {
          navigate('/company-buyer');
        } else {
          navigate('/individual-buyer');
        }
      } else {
        navigate(`/${user.role}`);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    // Get reCAPTCHA Enterprise token via execute (invisible mode)
    let recaptchaToken: string | null = null;
    
    if (recaptchaSiteKey) {
      try {
        // Check if grecaptcha is available for Enterprise execute
        const isGreCaptchaAvailable = () => {
          return window.grecaptcha && 
                 typeof window.grecaptcha.execute === 'function' &&
                 (window as any).recaptchaLoaded;
        };

        // Wait for Enterprise API to be available
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!isGreCaptchaAvailable() && attempts < maxAttempts) {
          console.log(`⏳ Waiting for reCAPTCHA Enterprise API... attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        if (isGreCaptchaAvailable()) {
          // Direct execute call for Enterprise (no ready() needed)
          recaptchaToken = await window.grecaptcha!.execute(recaptchaSiteKey, { 
            action: 'login' 
          });
          console.log('✅ reCAPTCHA Enterprise execute token obtained');
          console.log('   Action: login, Token length:', recaptchaToken.length);
        } else {
          console.warn('⚠️ reCAPTCHA Enterprise not available, proceeding without verification');
        }
      } catch (err) {
        console.error('Failed to execute reCAPTCHA Enterprise:', err);
        console.log('📝 Proceeding with login without reCAPTCHA verification');
        // Don't return here - continue with login
      }
    } else {
      console.log('⚠️ reCAPTCHA site key not available');
    }

    loginAttemptedRef.current = true;
    
    // Include reCAPTCHA token in login data if available
    const loginData: any = { ...data };
    if (recaptchaToken) {
      loginData.recaptchaToken = recaptchaToken;
    }

    dispatch(login(loginData));
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="login-card">
        <Link to="/" className="back-to-home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 18L2 10L10 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>
        
        <div className="login-header">
          <div className="logo-wrapper">
            <img src="/uthralogo.png" alt="Uthra Logo" className="logo-image" style={{height: '50px', width: 'auto', marginBottom: '10px'}} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v8h8V4H4zm2 2h4v1H6V6zm0 2h4v1H6V8z"/>
              </svg>
              Mobile Number
            </label>
            <input
              type="tel"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit mobile number',
                },
              })}
              className="form-control"
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.mobile && <span className="error">{errors.mobile.message}</span>}
          </div>

          <div className="form-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a3 3 0 00-3 3v1H4a1 1 0 00-1 1v7a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1h-1V4a3 3 0 00-3-3zM7 4a1 1 0 112 0v1H7V4zm1 5a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="form-control"
              placeholder="Enter your password"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* reCAPTCHA Enterprise - Visible Widget + Invisible Protection */}
          <div className="recaptcha-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            {recaptchaSiteKey ? (
              <>
                {/* Visible reCAPTCHA Enterprise widget for analytics */}
                <div id="recaptcha-container" style={{ marginBottom: '10px' }}></div>
                
                {/* Information about Enterprise protection */}
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e8f5e8', 
                  border: '1px solid #4caf50',
                  borderRadius: '4px',
                  color: '#2e7d32',
                  fontSize: '12px',
                  textAlign: 'center',
                  maxWidth: '400px'
                }}>
                  🛡️ This site is protected by reCAPTCHA Enterprise. Additional invisible verification will occur on login.
                  <br />
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{color: '#1976d2'}}>Privacy Policy</a> and 
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{color: '#1976d2'}}>Terms of Service</a> apply.
                </div>
              </>
            ) : (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#ffebee', 
                border: '1px solid #e57373',
                borderRadius: '4px',
                color: '#c62828',
                fontSize: '14px'
              }}>
                ⚠️ reCAPTCHA not configured.
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                Login
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-footer">
          <p className="signup-prompt">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <div className="ivr-note">
            <span className="ivr-icon">📞</span>
            <div>
              <strong>Farmers:</strong> You can also call our IVR number to access the platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
