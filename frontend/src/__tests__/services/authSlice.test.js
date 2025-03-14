import { vi, describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  setCredentials, 
  setUserData, 
  logOut,
  checkTokenExpiration
} from '../../features/auth/authSlice';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token) => {
    if (token === 'valid-token') {
      return {
        user: {
          id: 'user123',
          role: 'user',
        },
        exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
      };
    }
    if (token === 'expired-token') {
      return {
        user: {
          id: 'user123',
          role: 'user',
        },
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      };
    }
    return {};
  }),
}));

describe('Auth Slice', () => {
  // Create a store for testing
  const createTestStore = (initialState) => 
    configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: initialState }
    });

  describe('Initial State', () => {
    it('should return the initial auth state', () => {
      const store = createTestStore();
      const state = store.getState().auth;
      
      expect(state).toEqual({
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      });
    });
  });
  
  describe('setCredentials', () => {
    it('should set token and decode user info from valid token', () => {
      const store = createTestStore();
      
      store.dispatch(setCredentials({ accessToken: 'valid-token' }));
      
      const state = store.getState().auth;
      expect(state.token).toBe('valid-token');
      expect(state.id).toBe('user123');
      expect(state.role).toBe('user');
    });
    
    it('should not update state if no token is provided', () => {
      const initialState = {
        token: 'existing-token',
        role: 'admin',
        id: 'admin123',
        name: 'Admin User',
        email: 'admin@example.com',
      };
      
      const store = createTestStore(initialState);
      
      store.dispatch(setCredentials({}));
      
      // State should not change
      expect(store.getState().auth).toEqual(initialState);
    });
    
    it('should handle decoding errors gracefully', () => {
      // Mock jwtDecode to throw an error
      const originalJwtDecode = require('jwt-decode').jwtDecode;
      require('jwt-decode').jwtDecode = vi.fn().mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      const initialState = {
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      };
      
      const store = createTestStore(initialState);
      
      // This should not throw an error but should not update the state either
      store.dispatch(setCredentials({ accessToken: 'invalid-token' }));
      
      // The token is still set in the state even if decoding fails
      // This matches the actual implementation in authSlice.js
      const expectedState = {
        ...initialState,
        token: 'invalid-token',
      };
      
      expect(store.getState().auth).toEqual(expectedState);
      
      // Restore the original implementation
      require('jwt-decode').jwtDecode = originalJwtDecode;
    });
  });
  
  describe('setUserData', () => {
    it('should set user name and email', () => {
      const store = createTestStore();
      
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      store.dispatch(setUserData(userData));
      
      const state = store.getState().auth;
      expect(state.name).toBe(userData.name);
      expect(state.email).toBe(userData.email);
    });
  });
  
  describe('logOut', () => {
    it('should clear auth state on logout', () => {
      const initialState = {
        token: 'valid-token',
        role: 'user',
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const store = createTestStore(initialState);
      
      store.dispatch(logOut());
      
      const state = store.getState().auth;
      expect(state).toEqual({
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      });
    });
  });
  
  describe('checkTokenExpiration', () => {
    it('should clear auth state if token is expired', () => {
      const initialState = {
        token: 'expired-token',
        role: 'user',
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const store = createTestStore(initialState);
      
      store.dispatch(checkTokenExpiration());
      
      const state = store.getState().auth;
      expect(state).toEqual({
        token: null,
        role: null,
        id: null,
        name: 'John Doe',  // These are not cleared by checkTokenExpiration
        email: 'john@example.com',
      });
    });
    
    it('should maintain auth state if token is valid', () => {
      const initialState = {
        token: 'valid-token',
        role: 'user',
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const store = createTestStore(initialState);
      
      store.dispatch(checkTokenExpiration());
      
      // State should not change
      expect(store.getState().auth).toEqual(initialState);
    });
    
    it('should do nothing if there is no token', () => {
      const initialState = {
        token: null,
        role: null,
        id: null,
        name: null,
        email: null,
      };
      
      const store = createTestStore(initialState);
      
      store.dispatch(checkTokenExpiration());
      
      // State should not change
      expect(store.getState().auth).toEqual(initialState);
    });
  });
}); 