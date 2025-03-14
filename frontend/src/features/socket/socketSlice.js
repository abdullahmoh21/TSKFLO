import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connected: false,
  joinedConversations: [], // Track joined conversation IDs
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    addJoinedConversation: (state, action) => {
      const conversationId = action.payload;
      if (!state.joinedConversations.includes(conversationId)) {
        state.joinedConversations.push(conversationId);
      }
    },
    clearJoinedConversations: (state) => {
      state.joinedConversations = [];
    },
  },
});

export const { setConnected, addJoinedConversation, clearJoinedConversations } =
  socketSlice.actions;

// Selector for joined conversations
export const selectJoinedConversations = (state) =>
  state.socket.joinedConversations;

export default socketSlice.reducer;
