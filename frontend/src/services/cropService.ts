import api, { handleApiError } from './api';
import { ApiResponse, Crop, CreateCropData, CropFilters } from '../types';

export const cropService = {
  // Get all crops with optional filters
  getAllCrops: async (filters?: CropFilters): Promise<ApiResponse<Crop[]>> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/crops?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get crop by ID
  getCropById: async (id: string): Promise<ApiResponse<Crop>> => {
    try {
      const response = await api.get(`/crops/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search crops
  searchCrops: async (query: string, filters?: CropFilters): Promise<ApiResponse<Crop[]>> => {
    try {
      const response = await api.post('/crops/search', { query, ...filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get crops by category
  getCropsByCategory: async (category: string): Promise<ApiResponse<Crop[]>> => {
    try {
      const response = await api.get(`/crops/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new crop (Farmer only)
  createCrop: async (data: CreateCropData): Promise<ApiResponse<Crop>> => {
    try {
      const response = await api.post('/farmers/crops', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update crop (Farmer only)
  updateCrop: async (id: string, data: Partial<CreateCropData>): Promise<ApiResponse<Crop>> => {
    try {
      const response = await api.put(`/farmers/crops/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete crop (Farmer only)
  deleteCrop: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/farmers/crops/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get farmer's own crops
  getMyChops: async (): Promise<ApiResponse<Crop[]>> => {
    try {
      const response = await api.get('/farmers/crops/my');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
