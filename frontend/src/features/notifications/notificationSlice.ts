import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '../../services';
import { NotificationState, Notification } from '../../types';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Fetch all notifications
export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.getNotifications();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch notifications');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
  }
});

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.getUnreadCount();
    if (response.success && response.data) {
      return response.data.count;
    }
    return rejectWithValue(response.message || 'Failed to fetch unread count');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch unread count');
  }
});

// Mark notification as read
export const markAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notifications/markAsRead', async (id, { rejectWithValue }) => {
  try {
    const response = await notificationService.markAsRead(id);
    if (response.success) {
      return id;
    }
    return rejectWithValue(response.message || 'Failed to mark as read');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark as read');
  }
});

// Mark all as read
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.markAllAsRead();
    if (!response.success) {
      return rejectWithValue(response.message || 'Failed to mark all as read');
    }
    return undefined;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark all as read');
  }
});

// Delete notification
export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await notificationService.deleteNotification(id);
    if (response.success) {
      return id;
    }
    return rejectWithValue(response.message || 'Failed to delete notification');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete notification');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch unread count';
      })
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark as read';
      })
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark all as read';
      })
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete notification';
      });
  },
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
