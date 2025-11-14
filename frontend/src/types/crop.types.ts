// Crop related types
export type CropCategory = 'vegetables' | 'fruits' | 'grains' | 'pulses' | 'spices' | 'others';
export type CropStatus = 'available' | 'reserved' | 'sold';

export interface Quantity {
  value: number;
  unit: 'kg' | 'quintal' | 'ton' | 'bags';
}

export interface Price {
  value: number;
  unit: 'per_kg' | 'per_quintal' | 'per_ton' | 'per_bag';
}

export interface PickupLocation {
  district: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Crop {
  _id: string;
  farmer: string; // User ID
  name: string;
  category: CropCategory;
  quantity: Quantity;
  price: Price;
  description?: string;
  images?: string[];
  availableFrom: string;
  availableTo: string;
  pickupLocation: PickupLocation;
  qualityGrade?: string;
  organicCertified: boolean;
  status: CropStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CropState {
  crops: Crop[];
  selectedCrop: Crop | null;
  isLoading: boolean;
  error: string | null;
  filters: CropFilters;
}

export interface CropFilters {
  category?: CropCategory;
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  state?: string;
  organicOnly?: boolean;
  searchQuery?: string;
}

export interface CreateCropData {
  name: string;
  category: CropCategory;
  quantity: Quantity;
  price: Price;
  description?: string;
  availableFrom: string;
  availableTo: string;
  pickupLocation: PickupLocation;
  qualityGrade?: string;
  organicCertified?: boolean;
}
