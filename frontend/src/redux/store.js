import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 