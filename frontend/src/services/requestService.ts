import api, { handleApiError } from './api';
import { ApiResponse, Request, CreateRequestData, UpdateRequestStatusData } from '../types';

export const requestService = {
  // Create new request (Buyer only)
  createRequest: async (data: CreateRequestData): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.post('/buyers/requests', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get buyer's requests
  getMyRequests: async (): Promise<ApiResponse<Request[]>> => {
    try {
      const response = await api.get('/buyers/requests/my');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get farmer's incoming requests
  getFarmerRequests: async (): Promise<ApiResponse<Request[]>> => {
    try {
      const response = await api.get('/farmers/requests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get request by ID
  getRequestById: async (id: string): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update request status (Farmer)
  updateRequestStatus: async (data: UpdateRequestStatusData): Promise<ApiResponse<Request>> => {
    try {
      const { requestId, ...updateData } = data;
      const response = await api.put(`/farmers/requests/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept request (Farmer)
  acceptRequest: async (requestId: string, farmerResponse?: string, pickupDate?: string): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.post(`/farmers/requests/${requestId}/accept`, {
        farmerResponse,
        pickupDate,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject request (Farmer)
  rejectRequest: async (requestId: string, farmerResponse?: string): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.post(`/farmers/requests/${requestId}/reject`, {
        farmerResponse,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Cancel request (Buyer)
  cancelRequest: async (requestId: string): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.delete(`/buyers/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
