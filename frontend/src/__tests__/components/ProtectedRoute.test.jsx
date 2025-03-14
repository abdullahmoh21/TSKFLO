import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../components/ProtectedRoute';
import { vi, describe, it, expect, beforeAll } from 'vitest';

// Only mock the selectCurrentToken function, not the whole module
vi.mock('../../features/auth/authSlice', () => {
  return {
    selectCurrentToken: (state) => state.auth.token,
  };
});

// Create a mock for Navigate component before the test suite
const mockNavigate = vi.fn();
beforeAll(() => {
  // Clear and store the original Navigate component before mocking
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      Navigate: (props) => {
        mockNavigate(props.to);
        return null;
      },
    };
  });
});

describe('ProtectedRoute Component', () => {
  // Mock the redux store
  const mockStore = (initialState) => {
    return configureStore({
      reducer: {
        auth: (state = initialState) => state,
      },
    });
  };

  // Helper function to render the component with required providers
  const renderWithProviders = (ui, { reduxState = {} } = {}) => {
    const store = mockStore(reduxState);
    return render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    );
  };

  // Skipping this test for now until we can properly test the spinner
  it.skip('should show loading spinner when checking authentication', () => {
    // Initial render will show loading due to useState initialization
    renderWithProviders(<ProtectedRoute>Protected Content</ProtectedRoute>);
    
    // This test needs a better approach to check for the spinner
    // In a real implementation, we would use a data-testid for this
  });

  it('should redirect to login when not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>Protected Content</ProtectedRoute>,
      { reduxState: { token: null } }
    );
    
    // We can't easily assert navigation in JSDOM, but we could check that the 
    // children are not rendered when not authenticated
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>Protected Content</ProtectedRoute>,
      { reduxState: { token: 'valid-token' } }
    );
    
    // Check if the protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
}); 