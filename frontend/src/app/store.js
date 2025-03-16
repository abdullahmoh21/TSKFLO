import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import socketReducer from "../features/socket/socketSlice";
import { setupSocketListeners } from "../features/messages/messageApiSlice";
import { adminApiSlice } from "../features/admin/adminApiSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
    auth: authReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(adminApiSlice.middleware)
      .concat(setupSocketListeners), // Add our socket middleware
  devTools: true,
});

setupListeners(store.dispatch);

export default store;
