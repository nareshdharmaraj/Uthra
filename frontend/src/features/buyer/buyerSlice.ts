import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import buyerService from '../../services/buyerService';

interface BuyerProfile {
  _id: string;
  name: string;
  email?: string;
  mobile: string;
  location?: {
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  buyerDetails?: {
    businessName?: string;
    businessType?: string;
    organizationName?: string;
    organizationDescription?: string;
    yearEstablished?: number;
    gstNumber?: string;
    panNumber?: string;
    website?: string;
    preferredCategories?: string[];
    wantedCrops?: WantedCrop[];
    deliveryCapabilities?: {
      hasOwnTransport?: boolean;
      maxDeliveryRadius?: number;
      preferredPickupLocations?: string[];
    };
    paymentTerms?: {
      preferredMethod?: string;
      advancePayment?: boolean;
      creditDays?: number;
    };
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      accountHolderName?: string;
    };
  };
}

interface WantedCrop {
  _id: string;
  cropName: string;
  category?: string;
  requiredQuantity: number;
  unit: string;
  budgetPerUnit: number;
  frequency: string;
  districts?: string[];
  qualityPreference?: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
}

interface Farmer {
  _id: string;
  name: string;
  mobile: string;
  location?: {
    village?: string;
    district?: string;
    state?: string;
  };
  farmerDetails?: {
    farmSize?: number;
    farmingType?: string;
    preferredLanguage?: string;
  };
  activeCrops?: number;
}

interface DashboardStats {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    confirmedRequests: number;
    availableCrops: number;
  };
  recentRequests: any[];
}

interface BuyerState {
  profile: BuyerProfile | null;
  wantedCrops: WantedCrop[];
  farmers: Farmer[];
  selectedFarmer: any | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isFarmersLoading: boolean;
  error: string | null;
  successMessage: string | null;
  searchResults: {
    farmers: Farmer[];
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

const initialState: BuyerState = {
  profile: null,
  wantedCrops: [],
  farmers: [],
  selectedFarmer: null,
  dashboardStats: null,
  isLoading: false,
  isProfileLoading: false,
  isFarmersLoading: false,
  error: null,
  successMessage: null,
  searchResults: {
    farmers: [],
    total: 0,
    currentPage: 1,
    totalPages: 0
  }
};

// Async Thunks
export const fetchBuyerProfile = createAsyncThunk(
  'buyer/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buyerService.getBuyerProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateBuyerProfile = createAsyncThunk(
  'buyer/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await buyerService.updateBuyerProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchWantedCrops = createAsyncThunk(
  'buyer/fetchWantedCrops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buyerService.getWantedCrops();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wanted crops');
    }
  }
);

export const addWantedCrop = createAsyncThunk(
  'buyer/addWantedCrop',
  async (cropData: any, { rejectWithValue }) => {
    try {
      const response = await buyerService.addWantedCrop(cropData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add wanted crop');
    }
  }
);

export const updateWantedCrop = createAsyncThunk(
  'buyer/updateWantedCrop',
  async ({ cropId, cropData }: { cropId: string; cropData: any }, { rejectWithValue }) => {
    try {
      const response = await buyerService.updateWantedCrop(cropId, cropData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update wanted crop');
    }
  }
);

export const deleteWantedCrop = createAsyncThunk(
  'buyer/deleteWantedCrop',
  async (cropId: string, { rejectWithValue }) => {
    try {
      await buyerService.deleteWantedCrop(cropId);
      return cropId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete wanted crop');
    }
  }
);

export const searchFarmers = createAsyncThunk(
  'buyer/searchFarmers',
  async (searchParams: any, { rejectWithValue }) => {
    try {
      const response = await buyerService.searchFarmers(searchParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search farmers');
    }
  }
);

export const fetchFarmerDetails = createAsyncThunk(
  'buyer/fetchFarmerDetails',
  async (farmerId: string, { rejectWithValue }) => {
    try {
      const response = await buyerService.getFarmerDetails(farmerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch farmer details');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'buyer/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buyerService.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const buyerSlice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedFarmer: (state) => {
      state.selectedFarmer = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchBuyerProfile.pending, (state) => {
      state.isProfileLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBuyerProfile.fulfilled, (state, action) => {
      state.isProfileLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchBuyerProfile.rejected, (state, action) => {
      state.isProfileLoading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateBuyerProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateBuyerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
      state.successMessage = 'Profile updated successfully';
    });
    builder.addCase(updateBuyerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Wanted Crops
    builder.addCase(fetchWantedCrops.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWantedCrops.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wantedCrops = action.payload;
    });
    builder.addCase(fetchWantedCrops.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add Wanted Crop
    builder.addCase(addWantedCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addWantedCrop.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wantedCrops = action.payload;
      state.successMessage = 'Wanted crop added successfully';
    });
    builder.addCase(addWantedCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Wanted Crop
    builder.addCase(updateWantedCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateWantedCrop.fulfilled, (state) => {
      state.isLoading = false;
      state.successMessage = 'Wanted crop updated successfully';
    });
    builder.addCase(updateWantedCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Wanted Crop
    builder.addCase(deleteWantedCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteWantedCrop.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wantedCrops = state.wantedCrops.filter(crop => crop._id !== action.payload);
      state.successMessage = 'Wanted crop removed successfully';
    });
    builder.addCase(deleteWantedCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Search Farmers
    builder.addCase(searchFarmers.pending, (state) => {
      state.isFarmersLoading = true;
      state.error = null;
    });
    builder.addCase(searchFarmers.fulfilled, (state, action) => {
      state.isFarmersLoading = false;
      state.searchResults = {
        farmers: action.payload.data,
        total: action.payload.total,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages
      };
    });
    builder.addCase(searchFarmers.rejected, (state, action) => {
      state.isFarmersLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Farmer Details
    builder.addCase(fetchFarmerDetails.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFarmerDetails.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedFarmer = action.payload;
    });
    builder.addCase(fetchFarmerDetails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Dashboard Stats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.dashboardStats = action.payload;
    });
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearError, clearSuccessMessage, clearSelectedFarmer } = buyerSlice.actions;
export default buyerSlice.reducer;
