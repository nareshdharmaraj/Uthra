import api from './api';

// User Management
export const getAllUsers = async (params?: { role?: string; isActive?: boolean; page?: number; limit?: number }) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserDetails = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const changeUserPassword = async (userId: string, newPassword: string) => {
  const response = await api.put(`/admin/users/${userId}/change-password`, { newPassword });
  return response.data;
};

export const verifyUser = async (userId: string) => {
  const response = await api.put(`/admin/users/${userId}/verify`);
  return response.data;
};

export const activateUser = async (userId: string) => {
  const response = await api.put(`/admin/users/${userId}/activate`);
  return response.data;
};

export const deactivateUser = async (userId: string) => {
  const response = await api.put(`/admin/users/${userId}/deactivate`);
  return response.data;
};

// Crop Management
export const getAllCrops = async (params?: { status?: string; page?: number; limit?: number }) => {
  const response = await api.get('/admin/crops', { params });
  return response.data;
};

export const getCropDetails = async (cropId: string) => {
  const response = await api.get(`/admin/crops/${cropId}`);
  return response.data;
};

export const verifyCrop = async (cropId: string) => {
  const response = await api.put(`/admin/crops/${cropId}/verify`);
  return response.data;
};

export const deleteCrop = async (cropId: string) => {
  const response = await api.delete(`/admin/crops/${cropId}`);
  return response.data;
};

// Request Management
export const getAllRequests = async (params?: { status?: string; page?: number; limit?: number }) => {
  const response = await api.get('/admin/requests', { params });
  return response.data;
};

export const getRequestDetails = async (requestId: string) => {
  const response = await api.get(`/admin/requests/${requestId}`);
  return response.data;
};

// Analytics
export const getAnalyticsOverview = async () => {
  const response = await api.get('/admin/analytics/overview');
  return response.data;
};

export const getCropAnalytics = async () => {
  const response = await api.get('/admin/analytics/crops');
  return response.data;
};

export const getUserAnalytics = async () => {
  const response = await api.get('/admin/analytics/users');
  return response.data;
};

export const getTransactionAnalytics = async () => {
  const response = await api.get('/admin/analytics/transactions');
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await api.get('/admin/analytics/dashboard');
  return response.data;
};

// Call Logs
export const getCallLogs = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/call-logs', { params });
  return response.data;
};

export const getCallLogDetails = async (logId: string) => {
  const response = await api.get(`/admin/call-logs/${logId}`);
  return response.data;
};

// SMS Logs
export const getSMSLogs = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/sms-logs', { params });
  return response.data;
};

// Notifications
export const sendBroadcastNotification = async (data: {
  title: string;
  message: string;
  role?: string;
  userIds?: string[];
}) => {
  const response = await api.post('/admin/notifications/broadcast', data);
  return response.data;
};

export const getAllNotifications = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/notifications', { params });
  return response.data;
};

// Activity Logs
export const getActivityLogs = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/activity-logs', { params });
  return response.data;
};

// System Health
export const getSystemHealth = async () => {
  const response = await api.get('/admin/system/health');
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get('/admin/system/stats');
  return response.data;
};

// Reports
export const generateUserReport = async (params?: { startDate?: string; endDate?: string; role?: string }) => {
  const response = await api.get('/admin/reports/users', { params });
  return response.data;
};

export const generateTransactionReport = async (params?: { startDate?: string; endDate?: string; status?: string }) => {
  const response = await api.get('/admin/reports/transactions', { params });
  return response.data;
};

export const generateRevenueReport = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get('/admin/reports/revenue', { params });
  return response.data;
};

// System Settings
export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings/system');
  return response.data;
};

export const updateSystemSettings = async (settings: any) => {
  const response = await api.put('/admin/settings/system', settings);
  return response.data;
};

export const toggleMaintenanceMode = async (isOperational: boolean, reason?: string) => {
  const response = await api.post('/admin/settings/maintenance', { isOperational, reason });
  return response.data;
};

export const getMaintenanceLogs = async (params?: { limit?: number; page?: number }) => {
  const response = await api.get('/admin/settings/maintenance/logs', { params });
  return response.data;
};

const adminService = {
  // Users
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  changeUserPassword,
  verifyUser,
  activateUser,
  deactivateUser,
  // Crops
  getAllCrops,
  getCropDetails,
  verifyCrop,
  deleteCrop,
  // Requests
  getAllRequests,
  getRequestDetails,
  // Analytics
  getAnalyticsOverview,
  getCropAnalytics,
  getUserAnalytics,
  getTransactionAnalytics,
  getDashboardAnalytics,
  // Logs
  getCallLogs,
  getCallLogDetails,
  getSMSLogs,
  // Notifications
  sendBroadcastNotification,
  getAllNotifications,
  // Activity
  getActivityLogs,
  // System
  getSystemHealth,
  getSystemStats,
  // Reports
  generateUserReport,
  generateTransactionReport,
  generateRevenueReport,
  // System Settings
  getSystemSettings,
  updateSystemSettings,
  toggleMaintenanceMode,
  getMaintenanceLogs
};

export default adminService;
