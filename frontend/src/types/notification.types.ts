// Notification related types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'request' | 'payment';

export interface Notification {
  _id: string;
  recipient: string; // User ID
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}
