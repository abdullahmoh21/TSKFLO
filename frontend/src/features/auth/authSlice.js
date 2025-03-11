import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Function to load state from localStorage
const loadAuthState = () => {
  try {
    const serializedToken = localStorage.getItem('token');
    if (serializedToken === null) {
      return {
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      };
    }
    
    // Check if token is already a string or needs parsing
    let token;
    try {
      // Try to parse in case it's stored as JSON string
      token = JSON.parse(serializedToken);
    } catch (e) {
      // If parsing fails, use as-is (it's already a string)
      token = serializedToken;
    }

    try {
      const decoded = jwtDecode(token);
      return {
        token,
        role: decoded.user.role,
        id: decoded.user.id,
        name: null, // Will be populated by API call
        email: null, // Will be populated by API call
      };
    } catch (e) {
      // Invalid token, clear it
      console.error('Invalid token in localStorage:', e);
      localStorage.removeItem('token');
      return {
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      };
    }
  } catch (err) {
    console.error('Error loading auth state:', err);
    return {
      token: null,
      role: null,
      id: null,
      name: null,
      email: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      if (!accessToken) {
        console.error('No access token provided to setCredentials');
        return;
      }
      
      try {
        let decoded = jwtDecode(accessToken);
        state.token = accessToken;
        state.role = decoded.user.role;
        state.id = decoded.user.id;
        
        // Store token as string directly (no JSON.stringify)
        localStorage.setItem('token', accessToken);
      } catch (err) {
        console.error('Error setting credentials:', err);
      }
    },
    setUserData: (state, action) => {
      const { name, email } = action.payload;
      state.name = name;
      state.email = email;
    },
    logOut: (state, action) => {
      state.token = null;
      state.role = null;
      state.id = null;
      state.name = null;
      state.email = null;
      
      // Clear localStorage
      try {
        localStorage.removeItem('token');
      } catch (err) {
        console.error('Error clearing token from localStorage:', err);
      }
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
