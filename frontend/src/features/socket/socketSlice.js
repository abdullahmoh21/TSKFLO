import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connected: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
  },
});

export const { setConnected } = socketSlice.actions;
export default socketSlice.reducer;
