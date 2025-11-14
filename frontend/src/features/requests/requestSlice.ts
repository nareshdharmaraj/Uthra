import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { requestService } from '../../services';
import { RequestState, Request, CreateRequestData, UpdateRequestStatusData } from '../../types';

const initialState: RequestState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
};

// Create request (Buyer only)
export const createRequest = createAsyncThunk<
  Request,
  CreateRequestData,
  { rejectValue: string }
>('requests/create', async (requestData, { rejectWithValue }) => {
  try {
    const response = await requestService.createRequest(requestData);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to create request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to create request');
  }
});

// Get buyer's requests
export const fetchMyRequests = createAsyncThunk<
  Request[],
  void,
  { rejectValue: string }
>('requests/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const response = await requestService.getMyRequests();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch your requests');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch your requests');
  }
});

// Get farmer's incoming requests
export const fetchFarmerRequests = createAsyncThunk<
  Request[],
  void,
  { rejectValue: string }
>('requests/fetchFarmer', async (_, { rejectWithValue }) => {
  try {
    const response = await requestService.getFarmerRequests();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch requests');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch requests');
  }
});

// Get request by ID
export const fetchRequestById = createAsyncThunk<
  Request,
  string,
  { rejectValue: string }
>('requests/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await requestService.getRequestById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch request');
  }
});

// Update request status (Farmer)
export const updateRequestStatus = createAsyncThunk<
  Request,
  UpdateRequestStatusData,
  { rejectValue: string }
>('requests/updateStatus', async (data, { rejectWithValue }) => {
  try {
    const response = await requestService.updateRequestStatus(data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to update request');
  }
});

// Accept request (Farmer)
export const acceptRequest = createAsyncThunk<
  Request,
  { requestId: string; farmerResponse?: string; pickupDate?: string },
  { rejectValue: string }
>('requests/accept', async ({ requestId, farmerResponse, pickupDate }, { rejectWithValue }) => {
  try {
    const response = await requestService.acceptRequest(requestId, farmerResponse, pickupDate);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to accept request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to accept request');
  }
});

// Reject request (Farmer)
export const rejectRequest = createAsyncThunk<
  Request,
  { requestId: string; farmerResponse?: string },
  { rejectValue: string }
>('requests/reject', async ({ requestId, farmerResponse }, { rejectWithValue }) => {
  try {
    const response = await requestService.rejectRequest(requestId, farmerResponse);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to reject request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to reject request');
  }
});

// Cancel request (Buyer)
export const cancelRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('requests/cancel', async (requestId, { rejectWithValue }) => {
  try {
    const response = await requestService.cancelRequest(requestId);
    if (response.success) {
      return requestId;
    }
    return rejectWithValue(response.message || 'Failed to cancel request');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to cancel request');
  }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRequest: (state, action: PayloadAction<Request | null>) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create request';
      })
      // Fetch my requests
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch your requests';
      })
      // Fetch farmer requests
      .addCase(fetchFarmerRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFarmerRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchFarmerRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch requests';
      })
      // Fetch request by ID
      .addCase(fetchRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch request';
      })
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.selectedRequest?._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update request';
      })
      // Accept request
      .addCase(acceptRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.selectedRequest?._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(acceptRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to accept request';
      })
      // Reject request
      .addCase(rejectRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.selectedRequest?._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reject request';
      })
      // Cancel request
      .addCase(cancelRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = state.requests.filter((r) => r._id !== action.payload);
        if (state.selectedRequest?._id === action.payload) {
          state.selectedRequest = null;
        }
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to cancel request';
      });
  },
});

export const { clearError, setSelectedRequest } = requestSlice.actions;
export default requestSlice.reducer;
