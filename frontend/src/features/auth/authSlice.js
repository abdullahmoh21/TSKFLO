import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Function to initialize default auth state from localStorage
const loadAuthState = () => {
  try {
    const persistedToken = localStorage.getItem('token');
    
    if (persistedToken) {
      const decoded = jwtDecode(persistedToken);
      return {
        token: persistedToken,
        role: decoded.user.role,
        id: decoded.user.id,
        name: localStorage.getItem('userName') || null,
        email: localStorage.getItem('userEmail') || null,
      };
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
    // Clear any potentially corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  }
  
  return {
    token: null,
    role: null,
    id: null,
    name: null,
    email: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      if (!accessToken) {
        console.error("No access token provided to setCredentials");
        return;
      }

      try {
        let decoded = jwtDecode(accessToken);
        state.token = accessToken;
        state.role = decoded.user.role;
        state.id = decoded.user.id;
        
        // Persist to localStorage
        localStorage.setItem('token', accessToken);
      } catch (err) {
        console.error("Error setting credentials:", err);
      }
    },
    setUserData: (state, action) => {
      const { name, email } = action.payload;
      state.name = name;
      state.email = email;
      
      // Persist to localStorage
      if (name) localStorage.setItem('userName', name);
      if (email) localStorage.setItem('userEmail', email);
    },
    logOut: (state, action) => {
      state.token = null;
      state.role = null;
      state.id = null;
      state.name = null;
      state.email = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    },
  },
});

export const { setCredentials, setUserData, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;

export const selectCurrentUserRole = (state) => state.auth.role;

export const selectCurrentUserId = (state) => state.auth.id;

export const selectCurrentUserName = (state) => state.auth.name;

export const selectCurrentUserEmail = (state) => state.auth.email;
