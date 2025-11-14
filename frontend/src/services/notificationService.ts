import api, { handleApiError } from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const response = await api.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse> => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
