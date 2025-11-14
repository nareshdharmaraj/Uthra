import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cropReducer from './features/crops/cropSlice';
import requestReducer from './features/requests/requestSlice';
import notificationReducer from './features/notifications/notificationSlice';
import buyerReducer from './features/buyer/buyerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    crops: cropReducer,
    requests: requestReducer,
    notifications: notificationReducer,
    buyer: buyerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
