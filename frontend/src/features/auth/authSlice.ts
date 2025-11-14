import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services';
import {
  AuthState,
  User,
  RegisterStep1Data,
  RegisterStep2Data,
  RegisterStep3FarmerData,
  RegisterStep3BuyerData,
  RegisterStep4Data,
  LoginCredentials,
} from '../../types';

// Get user and token from localStorage
const storedUser = authService.getCurrentUser();
const storedToken = authService.getToken();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  registrationStage: 0,
  tempUserId: null,
};

// Register Step 1 - Initiate registration
export const registerStep1 = createAsyncThunk<
  { userId: string; otp?: string },
  RegisterStep1Data,
  { rejectValue: string }
>('auth/registerStep1', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.registerStep1(userData);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Registration failed');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
  }
});

// Register Step 2 - Location details
export const registerStep2 = createAsyncThunk<
  void,
  RegisterStep2Data,
  { rejectValue: string }
>('auth/registerStep2', async (locationData, { rejectWithValue }) => {
  try {
    const response = await authService.registerStep2(locationData);
    if (!response.success) {
      return rejectWithValue(response.message || 'Failed to save location');
    }
    return undefined;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to save location');
  }
});

// Register Step 3 - Farmer details
export const registerStep3Farmer = createAsyncThunk<
  void,
  RegisterStep3FarmerData,
  { rejectValue: string }
>('auth/registerStep3Farmer', async (detailsData, { rejectWithValue }) => {
  try {
    const response = await authService.registerStep3Farmer(detailsData);
    if (!response.success) {
      return rejectWithValue(response.message || 'Failed to save farmer details');
    }
    return undefined;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to save farmer details');
  }
});

// Register Step 3 - Buyer details
export const registerStep3Buyer = createAsyncThunk<
  void,
  RegisterStep3BuyerData,
  { rejectValue: string }
>('auth/registerStep3Buyer', async (detailsData, { rejectWithValue }) => {
  try {
    const response = await authService.registerStep3Buyer(detailsData);
    if (!response.success) {
      return rejectWithValue(response.message || 'Failed to save buyer details');
    }
    return undefined;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to save buyer details');
  }
});

// Register Step 4 - Complete registration
export const registerStep4 = createAsyncThunk<
  { token: string; user: User },
  RegisterStep4Data,
  { rejectValue: string }
>('auth/registerStep4', async (finalData, { rejectWithValue }) => {
  try {
    const response = await authService.registerStep4(finalData);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Registration completion failed');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Registration completion failed');
  }
});

// Login
export const login = createAsyncThunk<
  { token: string; user: User },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Login failed');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
  }
});

// PIN Login (for farmers)
export const pinLogin = createAsyncThunk<
  { token: string; user: User },
  { mobile: string; pin: string },
  { rejectValue: string }
>('auth/pinLogin', async ({ mobile, pin }, { rejectWithValue }) => {
  try {
    const response = await authService.pinLogin(mobile, pin);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'PIN login failed');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'PIN login failed');
  }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTempUserId: (state, action: PayloadAction<string | null>) => {
      state.tempUserId = action.payload;
    },
    setRegistrationStage: (state, action: PayloadAction<0 | 1 | 2 | 4>) => {
      state.registrationStage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Step 1
      .addCase(registerStep1.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStep1.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tempUserId = action.payload.userId;
        state.registrationStage = 1;
      })
      .addCase(registerStep1.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Register Step 2
      .addCase(registerStep2.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStep2.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationStage = 2;
      })
      .addCase(registerStep2.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to save location';
      })
      // Register Step 3 Farmer
      .addCase(registerStep3Farmer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStep3Farmer.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationStage = 4;
      })
      .addCase(registerStep3Farmer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to save farmer details';
      })
      // Register Step 3 Buyer
      .addCase(registerStep3Buyer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStep3Buyer.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationStage = 4;
      })
      .addCase(registerStep3Buyer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to save buyer details';
      })
      // Register Step 4
      .addCase(registerStep4.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStep4.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.tempUserId = null;
        state.registrationStage = 0;
      })
      .addCase(registerStep4.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration completion failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // PIN Login
      .addCase(pinLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(pinLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(pinLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'PIN login failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.tempUserId = null;
        state.registrationStage = 0;
      });
  },
});

export const { clearError, setTempUserId, setRegistrationStage } = authSlice.actions;
export default authSlice.reducer;
