// Request related types
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Request {
  _id: string;
  crop: string; // Crop ID
  buyer: string; // User ID
  farmer: string; // User ID
  requestedQuantity: {
    value: number;
    unit: 'kg' | 'quintal' | 'ton' | 'bags';
  };
  offeredPrice: {
    value: number;
    unit: 'per_kg' | 'per_quintal' | 'per_ton' | 'per_bag';
  };
  message?: string;
  status: RequestStatus;
  farmerResponse?: string;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestState {
  requests: Request[];
  selectedRequest: Request | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateRequestData {
  crop: string;
  requestedQuantity: {
    value: number;
    unit: 'kg' | 'quintal' | 'ton' | 'bags';
  };
  offeredPrice: {
    value: number;
    unit: 'per_kg' | 'per_quintal' | 'per_ton' | 'per_bag';
  };
  message?: string;
}

export interface UpdateRequestStatusData {
  requestId: string;
  status: RequestStatus;
  farmerResponse?: string;
  pickupDate?: string;
}
