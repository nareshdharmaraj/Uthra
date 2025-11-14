import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { login, clearError } from '../../features/auth/authSlice';
import { RootState } from '../../types';
import { AppDispatch } from '../../store';
import './Login.css';

interface LoginFormData {
  mobile: string;
  password?: string;
  pin?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

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

    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    }
  }, [user, error, isAuthenticated, navigate, dispatch]);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    dispatch(login(data));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🌾 Uthra</h1>
          <h2>Welcome Back</h2>
          <p>Login to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label>Mobile Number</label>
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
            <label>Password</label>
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

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p className="ivr-note">
            <strong>Farmers:</strong> You can also call our IVR number to access the platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
