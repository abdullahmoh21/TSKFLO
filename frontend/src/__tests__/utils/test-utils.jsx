import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import authReducer from '../../features/auth/authSlice';
import { describe, it, expect } from 'vitest';

/**
 * Create a testing redux store with optional preloaded state
 */
export function setupStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState,
  });
}

/**
 * Testing utility to render components with Redux and Router providers
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Mock authentication data helper
 */
export const mockAuthState = {
  auth: {
    token: 'mock-token',
    role: 'user',
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

/**
 * Mock admin authentication data helper
 */
export const mockAdminAuthState = {
  auth: {
    token: 'mock-admin-token',
    role: 'admin',
    id: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
  },
};

/**
 * Create a mock JWT token
 */
export function createMockJwt(userData = {}, expiresIn = 3600) {
  // Default user data
  const defaultUserData = {
    id: 'user123',
    role: 'user',
    email: 'test@example.com',
  };
  
  // Merge with provided user data
  const user = { ...defaultUserData, ...userData };
  
  // Current time and expiration
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresIn;
  
  // Mock token payload
  return {
    user,
    iat: now,
    exp,
    sub: user.id,
  };
}

// Add tests for the utility functions
describe('Test Utilities', () => {
  it('should create a store with default state', () => {
    const store = setupStore();
    expect(store).toBeDefined();
    expect(store.getState()).toHaveProperty('auth');
  });
  
  it('should create a mock JWT token with default values', () => {
    const token = createMockJwt();
    expect(token).toHaveProperty('user');
    expect(token.user).toHaveProperty('id', 'user123');
    expect(token.user).toHaveProperty('role', 'user');
    expect(token).toHaveProperty('exp');
  });
}); 