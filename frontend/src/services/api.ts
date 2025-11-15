import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - only clear token and redirect if it's an auth failure
        // Don't redirect if already on login page or if server is down
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response - Don't clear localStorage on network errors
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Error setting up request
      return Promise.reject(new Error(error.message || 'Request failed'));
    }
  }
);

export default api;

// Helper function for handling API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
