// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Common types
export interface SelectOption {
  value: string;
  label: string;
}

export interface FormError {
  field: string;
  message: string;
}

// Redux types
export interface RootState {
  auth: import('./user.types').AuthState;
  crops: import('./crop.types').CropState;
  requests: import('./request.types').RequestState;
  notifications: import('./notification.types').NotificationState;
}

// Re-export all types
export * from './user.types';
export * from './crop.types';
export * from './request.types';
export * from './notification.types';
