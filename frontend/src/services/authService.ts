import api, { handleApiError } from './api';
import {
  ApiResponse,
  RegisterStep1Data,
  RegisterStep2Data,
  RegisterStep3FarmerData,
  RegisterStep3BuyerData,
  RegisterStep4Data,
  LoginCredentials,
  User,
} from '../types';

export const authService = {
  // Registration Step 1 - Initiate registration
  registerStep1: async (data: RegisterStep1Data): Promise<ApiResponse<{ userId: string; otp?: string }>> => {
    try {
      const response = await api.post('/auth/register/initiate', data);
      return response.data;
    } catch (error) {
      // Handle specific validation errors
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please check your details and try again.');
    }
  },

  // Registration Step 2 - Location details
  registerStep2: async (data: RegisterStep2Data): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/step2', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Registration Step 3 - Role-specific details
  registerStep3Farmer: async (data: RegisterStep3FarmerData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/step3', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  registerStep3Buyer: async (data: RegisterStep3BuyerData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register/step3', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Registration Step 4 - Final step (email)
  registerStep4: async (data: RegisterStep4Data): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await api.post('/auth/register/step4', data);
      // Save token and user to localStorage
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      console.log('🔐 Login request:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login response:', response.data);
      // Save token and user to localStorage
      if (response.data.success && response.data.data) {
        console.log('💾 Saving to localStorage - user:', response.data.data.user);
        console.log('💾 User buyerType:', response.data.data.user.buyerType);
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Saved to localStorage');
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // PIN Login (for farmers via IVR)
  pinLogin: async (mobile: string, pin: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await api.post('/auth/login/pin', { mobile, pin });
      // Save token and user to localStorage
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  logout: (): void => {
    console.log('🚪 Logging out - clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ localStorage cleared');
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    console.log('🔍 getCurrentUser - Raw localStorage:', userStr);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 getCurrentUser - Parsed user:', user);
        console.log('🔍 getCurrentUser - buyerType:', user?.buyerType);
        // Validate that user object has required fields
        if (user && user.id && user.role) {
          return user;
        }
        // Invalid user data, clear it
        console.log('❌ Invalid user data, clearing localStorage');
        localStorage.removeItem('user');
        return null;
      } catch {
        // Parse error, clear invalid data
        console.log('❌ Parse error, clearing localStorage');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
