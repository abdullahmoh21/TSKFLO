import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setToken, clearToken, setUser } = authSlice.actions;
export default authSlice.reducer; 