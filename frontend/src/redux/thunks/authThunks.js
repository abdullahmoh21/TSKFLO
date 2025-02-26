import { loginStart, loginSuccess, loginFailure, logoutSuccess, getUserSuccess } from '../slices/authSlice';
import api from '../../services/api';

// Login thunk
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    // DEVELOPMENT ONLY: Mock login for testing
    // In production, this should be replaced with the actual API call
    if (process.env.NODE_ENV === 'development') {
      // Mock successful login with any email/password
      // You can customize this to require specific credentials if needed
      const mockToken = 'mock-jwt-token-for-development';
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch(loginSuccess({ accessToken: mockToken }));
      
      // Create a mock user
      const mockUser = {
        id: '1',
        name: credentials.email.split('@')[0], // Use part of email as name
        email: credentials.email,
        role: 'user'
      };
      
      dispatch(getUserSuccess(mockUser));
      
      return { payload: { success: true } };
    }
    
    // PRODUCTION: Use actual API
    const response = await api.post('/auth', credentials);
    dispatch(loginSuccess(response.data));
    
    // After successful login, fetch user data
    dispatch(fetchUserData());
    
    return { payload: { success: true } };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
    return { payload: { success: false, error: errorMessage } };
  }
};

// Fetch user data thunk
export const fetchUserData = () => async (dispatch) => {
  try {
    // For development, if we're using a mock token, return mock user data
    if (process.env.NODE_ENV === 'development' && 
        localStorage.getItem('token') === 'mock-jwt-token-for-development') {
      // Create a mock user - this is just for development
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };
      
      dispatch(getUserSuccess(mockUser));
      return mockUser;
    }
    
    const response = await api.get('/user/me');
    dispatch(getUserSuccess(response.data));
    return response.data;
  } catch (error) {
    // If we can't get user data, we should logout
    if (error.response?.status === 401) {
      dispatch(logout());
    }
    return null;
  }
};

// Register thunk
export const register = (userData) => async (dispatch) => {
  try {
    await api.post('/auth/register', userData);
    return { payload: { success: true } };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    return { payload: { success: false, error: errorMessage } };
  }
};

// Logout thunk
export const logout = () => async (dispatch) => {
  try {
    // In development with mock token, just remove the token
    if (process.env.NODE_ENV === 'development' && 
        localStorage.getItem('token') === 'mock-jwt-token-for-development') {
      dispatch(logoutSuccess());
      return;
    }
    
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    dispatch(logoutSuccess());
  }
};

// Check authentication status
export const checkAuthStatus = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // For development with mock token, create a mock user
      if (process.env.NODE_ENV === 'development' && 
          token === 'mock-jwt-token-for-development') {
        const mockUser = {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        };
        
        dispatch(getUserSuccess(mockUser));
        return;
      }
      
      // Fetch user data to verify token is still valid
      dispatch(fetchUserData());
    } catch (error) {
      // If token is invalid, clear it
      dispatch(logoutSuccess());
    }
  }
}; 