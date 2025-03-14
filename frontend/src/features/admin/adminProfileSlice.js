import { createSlice } from '@reduxjs/toolkit';
import { adminApiSlice } from './adminApiSlice';

const initialState = {
  name: '',
  email: '',
  phone: '',
  role: 'admin'
};

const adminProfileSlice = createSlice({
  name: 'adminProfile',
  initialState,
  reducers: {
    setAdminProfile: (state, action) => {
      const { name, email, phone } = action.payload;
      state.name = name;
      state.email = email;
      state.phone = phone;
    },
    clearAdminProfile: (state) => {
      state.name = '';
      state.email = '';
      state.phone = '';
    }
  }
});

export const { setAdminProfile, clearAdminProfile } = adminProfileSlice.actions;
export default adminProfileSlice.reducer;

export const selectCurrentAdminProfile = (state) => state.adminProfile; 