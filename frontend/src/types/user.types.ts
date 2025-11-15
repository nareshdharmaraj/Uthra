// User related types
export type UserRole = 'farmer' | 'buyer' | 'admin';
export type RegistrationStage = 0 | 1 | 2 | 4; // As per backend implementation

export interface Location {
  address: string;
  village: string;
  pincode: string;
  district: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface FarmerDetails {
  farmSize: number;
  farmingType: 'organic' | 'conventional' | 'mixed';
  crops: string[];
  bankDetails: BankDetails;
}

export interface BuyerDetails {
  businessName: string;
  businessType: 'wholesaler' | 'retailer' | 'processor' | 'exporter';
  companyName?: string;
  companyRegistrationNumber?: string;
  numberOfEmployees?: number;
  gstNumber?: string;
  preferredCategories: string[];
}

export interface User {
  _id: string;
  mobile: string;
  name: string;
  email?: string;
  role: UserRole;
  location?: Location;
  farmerDetails?: FarmerDetails;
  buyerDetails?: BuyerDetails;
  pin?: string; // For farmers (IVR)
  isVerified: boolean;
  isActive: boolean;
  registrationStage: RegistrationStage;
  registrationCompleted?: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationStage: RegistrationStage;
  tempUserId: string | null;
  tempBuyerType: 'individual' | 'company' | null;
}

// Registration form types
export interface RegisterStep1Data {
  mobile: string;
  name: string;
  role: UserRole;
  buyerType?: 'individual' | 'company';
}

export interface RegisterStep2Data {
  userId: string;
  location: Location;
}

export interface RegisterStep3FarmerData {
  userId: string;
  farmerDetails: FarmerDetails;
  pin: string;
}

export interface RegisterStep3BuyerData {
  userId: string;
  buyerDetails: BuyerDetails;
  password: string;
}

export interface RegisterStep4Data {
  userId: string;
  email?: string;
}

export interface LoginCredentials {
  mobile: string;
  password?: string;
  pin?: string;
}
