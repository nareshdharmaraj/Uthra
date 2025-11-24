import React, { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  registerStep1,
  registerStep2,
  registerStep3Farmer,
  registerStep3Buyer,
  registerStep4,
  clearError,
  setRegistrationStage,
} from '../../features/auth/authSlice';
import { RootState, UserRole } from '../../types';
import { AppDispatch } from '../../store';
import './Register.css';

// Form data interfaces for each step
interface Step1FormData {
  mobile: string;
  name: string;
  role: UserRole;
  buyerType?: 'individual' | 'company';
}

interface Step2FormData {
  address: string;
  village: string;
  pincode: string;
  district: string;
  state: string;
}

interface Step3FarmerFormData {
  farmSize: number;
  farmingType: 'organic' | 'conventional' | 'mixed';
  crops: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  pin: string;
  password: string;
  confirmPassword: string;
}

interface Step3BuyerFormData {
  businessName: string;
  businessType: 'wholesaler' | 'retailer' | 'processor' | 'exporter';
  companyName?: string;
  companyRegistrationNumber?: string;
  numberOfEmployees?: number;
  gstNumber?: string;
  preferredCategories: string;
  password: string;
  confirmPassword: string;
}

interface Step4FormData {
  email?: string;
  agreeToTerms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roleFromURL = searchParams.get('role') as UserRole | null;

  const { user, isLoading, error, isAuthenticated, registrationStage, tempUserId, tempBuyerType } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step1FormData & Step2FormData & Step3FarmerFormData & Step3BuyerFormData & Step4FormData>({
    defaultValues: {
      role: roleFromURL || 'farmer',
      state: 'Tamil Nadu',
    },
  });

  const selectedRole = watch('role');

  // Security: Redirect authenticated users away from registration
  useEffect(() => {
    if (isAuthenticated && user) {
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

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle redirection after successful registration
  useEffect(() => {
    // Only redirect when registration is successfully completed
    // Registration completion is indicated by:
    // - User is authenticated (has token)
    // - Registration stage is reset to 0
    // - tempUserId is cleared (null)
    // This specifically catches the moment AFTER step 4 completes
    if (isAuthenticated && user && registrationStage === 0 && tempUserId === null) {
      // Check if this is a fresh registration completion by checking if we have user data
      // and the user object has registrationCompleted = true
      if (user.registrationCompleted) {
        toast.success('Registration completed successfully! Welcome to Uthra!');
        setTimeout(() => {
          navigate(`/${user.role}`);
        }, 1000);
      }
    }
  }, [isAuthenticated, user, registrationStage, tempUserId, navigate]);

  useEffect(() => {
    if (roleFromURL) {
      setValue('role', roleFromURL);
    }
  }, [roleFromURL, setValue]);

  // Step 1 - Basic Information
  const onSubmitStep1: SubmitHandler<Step1FormData> = async (data) => {
    // Validate buyerType if role is buyer
    if (data.role === 'buyer' && !data.buyerType) {
      toast.error('Please select buyer type (Individual or Company)');
      return;
    }

    await dispatch(
      registerStep1({
        mobile: data.mobile,
        name: data.name,
        role: data.role,
        buyerType: data.buyerType,
      })
    );
  };

  // Step 2 - Location
  const onSubmitStep2: SubmitHandler<Step2FormData> = async (data) => {
    if (!tempUserId) {
      toast.error('User ID not found. Please restart registration.');
      dispatch(setRegistrationStage(0));
      return;
    }

    await dispatch(
      registerStep2({
        userId: tempUserId,
        location: {
          address: data.address,
          village: data.village,
          pincode: data.pincode,
          district: data.district,
          state: data.state,
        },
      })
    );
  };

  // Step 3 - Farmer Details
  const onSubmitStep3Farmer: SubmitHandler<Step3FarmerFormData> = async (data) => {
    if (!tempUserId) {
      toast.error('User ID not found. Please restart registration.');
      dispatch(setRegistrationStage(0));
      return;
    }

    const cropsArray = data.crops
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    await dispatch(
      registerStep3Farmer({
        userId: tempUserId,
        farmerDetails: {
          farmSize: Number(data.farmSize),
          farmingType: data.farmingType,
          crops: cropsArray,
          bankDetails: {
            accountHolderName: data.accountHolderName,
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode.toUpperCase(),
            bankName: data.bankName,
          },
        },
        pin: data.pin,
        password: data.password,
      })
    );
  };

  // Step 3 - Buyer Details
  const onSubmitStep3Buyer: SubmitHandler<Step3BuyerFormData> = async (data) => {
    if (!tempUserId) {
      toast.error('User ID not found. Please restart registration.');
      dispatch(setRegistrationStage(0));
      return;
    }

    const categoriesArray = data.preferredCategories
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    await dispatch(
      registerStep3Buyer({
        userId: tempUserId,
        buyerDetails: {
          businessName: data.businessName,
          businessType: data.businessType,
          companyName: data.companyName,
          companyRegistrationNumber: data.companyRegistrationNumber,
          numberOfEmployees: data.numberOfEmployees,
          gstNumber: data.gstNumber,
          preferredCategories: categoriesArray,
        },
        password: data.password,
      })
    );
  };

  // Step 4 - Complete
  const onSubmitStep4: SubmitHandler<Step4FormData> = async (data) => {
    if (!tempUserId) {
      toast.error('User ID not found. Please restart registration.');
      dispatch(setRegistrationStage(0));
      return;
    }

    await dispatch(
      registerStep4({
        userId: tempUserId,
        email: data.email,
      })
    );
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit(onSubmitStep1)} className="form-step">
      <h3>Basic Information</h3>

      <div className="form-group">
        <label>I am a *</label>
        <select {...register('role', { required: 'Role is required' })} className="form-control">
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>
        {errors.role && <span className="error">{errors.role.message}</span>}
      </div>

      {/* Show buyer type selection if buyer role is selected */}
      {selectedRole === 'buyer' && (
        <div className="form-group">
          <label>Buyer Type *</label>
          <select 
            {...register('buyerType', { 
              required: selectedRole === 'buyer' ? 'Buyer type is required' : false 
            })} 
            className="form-control"
          >
            <option value="">Select buyer type...</option>
            <option value="individual">Individual Buyer</option>
            <option value="company">Company/Organization</option>
          </select>
          {errors.buyerType && <span className="error">{errors.buyerType.message}</span>}
          <small className="form-text">
            Choose <strong>Individual</strong> for personal purchases or <strong>Company</strong> for business/organization
          </small>
        </div>
      )}

      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 3, message: 'Name must be at least 3 characters' },
            pattern: {
              value: /^[a-zA-Z\s]+$/,
              message: 'Name should contain only letters and spaces'
            }
          })}
          className="form-control"
          placeholder="Enter your full name"
          onInput={(e) => {
            // Allow only letters and spaces
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^a-zA-Z\s]/g, '');
          }}
        />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label>Mobile Number *</label>
        <input
          type="tel"
          {...register('mobile', {
            required: 'Mobile number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Please enter a valid 10-digit mobile number (only numbers)',
            },
            maxLength: {
              value: 10,
              message: 'Mobile number must be exactly 10 digits'
            }
          })}
          className="form-control"
          placeholder="10-digit mobile number (e.g., 9876543210)"
          maxLength={10}
          onInput={(e) => {
            // Allow only digits
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^0-9]/g, '');
          }}
        />
        {errors.mobile && <span className="error">{errors.mobile.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit(onSubmitStep2)} className="form-step">
      <h3>Location Details</h3>

      <div className="form-group">
        <label>Address / Street *</label>
        <input
          type="text"
          {...register('address', {
            required: 'Address is required',
            minLength: { value: 5, message: 'Address must be at least 5 characters' },
          })}
          className="form-control"
          placeholder="Enter your address"
        />
        {errors.address && <span className="error">{errors.address.message}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Village / Town *</label>
          <input
            type="text"
            {...register('village', { required: 'Village/Town is required' })}
            className="form-control"
            placeholder="Village or Town"
          />
          {errors.village && <span className="error">{errors.village.message}</span>}
        </div>

        <div className="form-group">
          <label>Pincode *</label>
          <input
            type="text"
            {...register('pincode', {
              required: 'Pincode is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'Enter valid 6-digit pincode',
              },
            })}
            className="form-control"
            placeholder="6-digit pincode"
            maxLength={6}
          />
          {errors.pincode && <span className="error">{errors.pincode.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>District *</label>
          <input
            type="text"
            {...register('district', { required: 'District is required' })}
            className="form-control"
            placeholder="District"
          />
          {errors.district && <span className="error">{errors.district.message}</span>}
        </div>

        <div className="form-group">
          <label>State *</label>
          <input
            type="text"
            {...register('state', { required: 'State is required' })}
            className="form-control"
            placeholder="State"
          />
          {errors.state && <span className="error">{errors.state.message}</span>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep3Farmer = () => (
    <form onSubmit={handleSubmit(onSubmitStep3Farmer)} className="form-step">
      <h3>Farmer Details</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Farm Size (acres) *</label>
          <input
            type="number"
            step="0.01"
            {...register('farmSize', {
              required: 'Farm size is required',
              min: { value: 0.1, message: 'Minimum 0.1 acre' },
            })}
            className="form-control"
            placeholder="e.g., 5"
          />
          {errors.farmSize && <span className="error">{errors.farmSize.message}</span>}
        </div>

        <div className="form-group">
          <label>Farming Type *</label>
          <select {...register('farmingType', { required: 'Farming type is required' })} className="form-control">
            <option value="">Select...</option>
            <option value="organic">Organic</option>
            <option value="conventional">Conventional</option>
            <option value="mixed">Mixed</option>
          </select>
          {errors.farmingType && <span className="error">{errors.farmingType.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Crops Grown (comma separated) *</label>
        <input
          type="text"
          {...register('crops', { required: 'Enter at least one crop' })}
          className="form-control"
          placeholder="e.g., Rice, Wheat, Tomato"
        />
        {errors.crops && <span className="error">{errors.crops.message}</span>}
      </div>

      <h4>Bank Details</h4>

      <div className="form-group">
        <label>Account Holder Name *</label>
        <input
          type="text"
          {...register('accountHolderName', { 
            required: 'Account holder name is required',
            pattern: {
              value: /^[a-zA-Z\s]+$/,
              message: 'Account holder name should contain only letters and spaces'
            }
          })}
          className="form-control"
          placeholder="As per bank records"
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^a-zA-Z\s]/g, '');
          }}
        />
        {errors.accountHolderName && <span className="error">{errors.accountHolderName.message}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Account Number *</label>
          <input
            type="text"
            {...register('accountNumber', {
              required: 'Account number is required',
              minLength: { value: 9, message: 'Account number must be at least 9 digits' },
              maxLength: { value: 18, message: 'Account number cannot exceed 18 digits' },
              pattern: {
                value: /^[0-9]+$/,
                message: 'Account number should contain only numbers'
              }
            })}
            className="form-control"
            placeholder="Bank account number (numbers only)"
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9]/g, '');
            }}
          />
          {errors.accountNumber && <span className="error">{errors.accountNumber.message}</span>}
        </div>

        <div className="form-group">
          <label>IFSC Code *</label>
          <input
            type="text"
            {...register('ifscCode', {
              required: 'IFSC code is required',
              pattern: {
                value: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
                message: 'Invalid IFSC code',
              },
            })}
            className="form-control"
            placeholder="e.g., SBIN0001234"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.ifscCode && <span className="error">{errors.ifscCode.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Bank Name *</label>
        <input
          type="text"
          {...register('bankName', { required: 'Bank name is required' })}
          className="form-control"
          placeholder="Bank name"
        />
        {errors.bankName && <span className="error">{errors.bankName.message}</span>}
      </div>

      <div className="form-group">
        <label>Create 4-6 Digit PIN (for IVR) *</label>
        <input
          type="password"
          {...register('pin', {
            required: 'PIN is required',
            pattern: {
              value: /^[0-9]{4,6}$/,
              message: 'PIN must be 4-6 digits',
            },
          })}
          className="form-control"
          placeholder="Enter PIN"
          maxLength={6}
        />
        {errors.pin && <span className="error">{errors.pin.message}</span>}
        <small className="form-text">You'll use this PIN to access your account via phone call</small>
      </div>

      <div className="form-group">
        <label>Create Password (for Web Access) *</label>
        <input
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          className="form-control"
          placeholder="Enter password"
        />
        {errors.password && <span className="error">{errors.password.message}</span>}
        <small className="form-text">You'll use this password to access your account on the website</small>
      </div>

      <div className="form-group">
        <label>Confirm Password *</label>
        <input
          type="password"
          {...register('confirmPassword', {
            required: 'Please confirm password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
          className="form-control"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep3Buyer = () => (
    <form onSubmit={handleSubmit(onSubmitStep3Buyer)} className="form-step">
      <h3>{tempBuyerType === 'company' ? 'Company Details' : 'Buyer Details'}</h3>

      {/* Show company-specific fields if buyerType is company */}
      {tempBuyerType === 'company' && (
        <>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              {...register('companyName', {
                required: tempBuyerType === 'company' ? 'Company name is required' : false,
                minLength: { value: 3, message: 'Company name must be at least 3 characters' },
              })}
              className="form-control"
              placeholder="Your company name"
            />
            {errors.companyName && <span className="error">{errors.companyName.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Registration Number</label>
              <input
                type="text"
                {...register('companyRegistrationNumber')}
                className="form-control"
                placeholder="Registration number"
              />
            </div>

            <div className="form-group">
              <label>Number of Employees</label>
              <input
                type="number"
                {...register('numberOfEmployees', {
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="form-control"
                placeholder="Number of employees"
              />
              {errors.numberOfEmployees && <span className="error">{errors.numberOfEmployees.message}</span>}
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Business Name *</label>
        <input
          type="text"
          {...register('businessName', {
            required: 'Business name is required',
            minLength: { value: 3, message: 'Business name must be at least 3 characters' },
          })}
          className="form-control"
          placeholder="Your business name"
        />
        {errors.businessName && <span className="error">{errors.businessName.message}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Business Type *</label>
          <select {...register('businessType', { required: 'Business type is required' })} className="form-control">
            <option value="">Select...</option>
            <option value="retailer">Retailer</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="exporter">Exporter</option>
            <option value="processor">Processor</option>
          </select>
          {errors.businessType && <span className="error">{errors.businessType.message}</span>}
        </div>

        <div className="form-group">
          <label>GST Number (Optional)</label>
          <input
            type="text"
            {...register('gstNumber', {
              pattern: {
                value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
                message: 'Invalid GST number format',
              },
            })}
            className="form-control"
            placeholder="GST Number"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.gstNumber && <span className="error">{errors.gstNumber.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Preferred Categories (comma separated) *</label>
        <input
          type="text"
          {...register('preferredCategories', { required: 'Enter at least one category' })}
          className="form-control"
          placeholder="e.g., vegetables, fruits, grains"
        />
        {errors.preferredCategories && <span className="error">{errors.preferredCategories.message}</span>}
      </div>

      <div className="form-group">
        <label>Create Password *</label>
        <input
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          className="form-control"
          placeholder="Enter password"
        />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <div className="form-group">
        <label>Confirm Password *</label>
        <input
          type="password"
          {...register('confirmPassword', {
            required: 'Please confirm password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
          className="form-control"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep3 = () => {
    return selectedRole === 'farmer' ? renderStep3Farmer() : renderStep3Buyer();
  };

  const renderStep4 = () => (
    <form onSubmit={handleSubmit(onSubmitStep4)} className="form-step">
      <h3>Complete Registration</h3>

      <div className="success-message">
        <div className="success-icon">✓</div>
        <p>Almost done! Please verify your details.</p>
      </div>

      <div className="form-group">
        <label>Email Address (Optional)</label>
        <input
          type="email"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          className="form-control"
          placeholder="your@email.com"
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
        <small className="form-text">We'll send you important updates via email</small>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" {...register('agreeToTerms', { required: 'You must agree to terms' })} />
          <span>I agree to the Terms and Conditions and Privacy Policy</span>
        </label>
        {errors.agreeToTerms && <span className="error">{errors.agreeToTerms.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Completing Registration...' : 'Complete Registration'}
      </button>
    </form>
  );

  // Determine which step to display based on current registration stage
  const getCurrentStepIndex = () => {
    switch (registrationStage) {
      case 0:
        return 1;
      case 1:
        return 2;
      case 2:
        return 3;
      case 4:
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src="/uthralogo.png" alt="Uthra Logo" style={{height: '60px', width: 'auto', marginBottom: '10px'}} />
          <h2>Create Account</h2>
          <div className="steps-indicator">
            <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
            <div className={`step-line ${currentStep >= 4 ? 'active' : ''}`}></div>
            <div className={`step-dot ${currentStep >= 4 ? 'active' : ''}`}>4</div>
          </div>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
