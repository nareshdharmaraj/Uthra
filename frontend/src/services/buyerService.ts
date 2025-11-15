import api from './api';

// Profile APIs
export const getBuyerProfile = async () => {
  const response = await api.get('/buyers/profile');
  return response.data;
};

export const updateBuyerProfile = async (profileData: any) => {
  const response = await api.put('/buyers/profile', profileData);
  return response.data;
};

// Wanted Crops APIs
export const getWantedCrops = async () => {
  const response = await api.get('/buyers/wanted-crops');
  return response.data;
};

export const addWantedCrop = async (cropData: any) => {
  const response = await api.post('/buyers/wanted-crops', cropData);
  return response.data;
};

export const updateWantedCrop = async (cropId: string, cropData: any) => {
  const response = await api.put(`/buyers/wanted-crops/${cropId}`, cropData);
  return response.data;
};

export const deleteWantedCrop = async (cropId: string) => {
  const response = await api.delete(`/buyers/wanted-crops/${cropId}`);
  return response.data;
};

// Farmer Search APIs
export const searchFarmers = async (searchParams: {
  searchTerm?: string;
  district?: string;
  state?: string;
  farmingType?: string;
  hasActiveCrops?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.post('/buyers/farmers/search', searchParams);
  return response.data;
};

export const getFarmerDetails = async (farmerId: string) => {
  const response = await api.get(`/buyers/farmers/${farmerId}`);
  return response.data;
};

// Dashboard APIs
export const getDashboardStats = async () => {
  const response = await api.get('/buyers/dashboard');
  return response.data;
};

// Browse Crops APIs
export const browseCrops = async (params: {
  category?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  );
  const response = await api.get(`/buyers/crops?${queryParams}`);
  return response.data;
};

export const searchCrops = async (searchParams: {
  searchTerm?: string;
  filters?: {
    category?: string;
    district?: string;
    quality?: string;
  };
  page?: number;
  limit?: number;
}) => {
  const response = await api.post('/buyers/crops/search', searchParams);
  return response.data;
};

export const getCropDetails = async (cropId: string) => {
  const response = await api.get(`/buyers/crops/${cropId}`);
  return response.data;
};

// Request APIs
export const createRequest = async (requestData: {
  cropId: string;
  requestedQuantity: number;
  offeredPrice: number;
  deliveryAddress?: any;
  buyerNote?: string;
}) => {
  const response = await api.post('/buyers/requests', requestData);
  return response.data;
};

export const getMyRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  );
  const response = await api.get(`/buyers/requests?${queryParams}`);
  return response.data;
};

export const getRequestDetails = async (requestId: string) => {
  const response = await api.get(`/buyers/requests/${requestId}`);
  return response.data;
};

export const acceptCounterOffer = async (requestId: string) => {
  const response = await api.put(`/buyers/requests/${requestId}/accept`);
  return response.data;
};

export const cancelRequest = async (requestId: string) => {
  const response = await api.put(`/buyers/requests/${requestId}/cancel`);
  return response.data;
};

const buyerService = {
  getBuyerProfile,
  updateBuyerProfile,
  getWantedCrops,
  addWantedCrop,
  updateWantedCrop,
  deleteWantedCrop,
  searchFarmers,
  getFarmerDetails,
  getDashboardStats,
  browseCrops,
  searchCrops,
  getCropDetails,
  createRequest,
  getMyRequests,
  getRequestDetails,
  acceptCounterOffer,
  cancelRequest
};

export default buyerService;
