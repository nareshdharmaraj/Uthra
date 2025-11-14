import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cropService } from '../../services';
import { CropState, Crop, CreateCropData, CropFilters } from '../../types';

const initialState: CropState = {
  crops: [],
  selectedCrop: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Get all crops
export const fetchCrops = createAsyncThunk<
  Crop[],
  CropFilters | undefined,
  { rejectValue: string }
>('crops/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const response = await cropService.getAllCrops(filters);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch crops');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch crops');
  }
});

// Get crop by ID
export const fetchCropById = createAsyncThunk<
  Crop,
  string,
  { rejectValue: string }
>('crops/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await cropService.getCropById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch crop');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch crop');
  }
});

// Search crops
export const searchCrops = createAsyncThunk<
  Crop[],
  { query: string; filters?: CropFilters },
  { rejectValue: string }
>('crops/search', async ({ query, filters }, { rejectWithValue }) => {
  try {
    const response = await cropService.searchCrops(query, filters);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Search failed');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Search failed');
  }
});

// Create crop (Farmer only)
export const createCrop = createAsyncThunk<
  Crop,
  CreateCropData,
  { rejectValue: string }
>('crops/create', async (cropData, { rejectWithValue }) => {
  try {
    const response = await cropService.createCrop(cropData);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to create crop');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to create crop');
  }
});

// Update crop (Farmer only)
export const updateCrop = createAsyncThunk<
  Crop,
  { id: string; data: Partial<CreateCropData> },
  { rejectValue: string }
>('crops/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await cropService.updateCrop(id, data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update crop');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to update crop');
  }
});

// Delete crop (Farmer only)
export const deleteCrop = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('crops/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await cropService.deleteCrop(id);
    if (response.success) {
      return id;
    }
    return rejectWithValue(response.message || 'Failed to delete crop');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete crop');
  }
});

// Get farmer's own crops
export const fetchMyCrops = createAsyncThunk<
  Crop[],
  void,
  { rejectValue: string }
>('crops/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const response = await cropService.getMyChops();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch your crops');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch your crops');
  }
});

const cropSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<CropFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedCrop: (state, action: PayloadAction<Crop | null>) => {
      state.selectedCrop = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all crops
      .addCase(fetchCrops.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = action.payload;
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch crops';
      })
      // Fetch crop by ID
      .addCase(fetchCropById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCropById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCrop = action.payload;
      })
      .addCase(fetchCropById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch crop';
      })
      // Search crops
      .addCase(searchCrops.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCrops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = action.payload;
      })
      .addCase(searchCrops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Search failed';
      })
      // Create crop
      .addCase(createCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops.unshift(action.payload);
      })
      .addCase(createCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create crop';
      })
      // Update crop
      .addCase(updateCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.crops.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.crops[index] = action.payload;
        }
        if (state.selectedCrop?._id === action.payload._id) {
          state.selectedCrop = action.payload;
        }
      })
      .addCase(updateCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update crop';
      })
      // Delete crop
      .addCase(deleteCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = state.crops.filter((c) => c._id !== action.payload);
        if (state.selectedCrop?._id === action.payload) {
          state.selectedCrop = null;
        }
      })
      .addCase(deleteCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete crop';
      })
      // Fetch my crops
      .addCase(fetchMyCrops.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyCrops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = action.payload;
      })
      .addCase(fetchMyCrops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch your crops';
      });
  },
});

export const { clearError, setFilters, clearFilters, setSelectedCrop } = cropSlice.actions;
export default cropSlice.reducer;
