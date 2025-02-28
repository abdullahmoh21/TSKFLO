import React from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from '../authSlice';
import { decodeToken } from '../utils/auth';
import { useHistory } from 'react-router-dom';

const LoginComponent = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogin = async () => {
    // Assume login API call here
    const response = await loginApiCall();

    if (response.status === 200) {
      const token = response.data.token;
      dispatch(setToken(token));

      const decoded = decodeToken(token);
      if (decoded) {
        const role = decoded.role;
        if (role === '0000') {
          history.push('/admindashboard');
        } else {
          history.push('/dashboard');
        }
      }
    } else {
      console.error('Login failed');
    }
  };

  return (
    <button onClick={handleLogin}>Login</button>
  );
};

export default LoginComponent; 