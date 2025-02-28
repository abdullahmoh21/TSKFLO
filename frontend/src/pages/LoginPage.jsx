import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../authSlice';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginApiCall = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3200/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!email) {
      newErrors.email = "Please enter your email.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const result = await loginApiCall(email, password);
      
      // Check for accessToken instead of success
      if (result.accessToken) {
        const token = result.accessToken;
        console.log('Your JWT Token:', token);

        // Store the token in Redux
        dispatch(setToken(token));

        // Decode the token and store user data
        const decoded = jwtDecode(token);
        console.log('Decoded Token:', decoded);
        
        // Store user data in Redux
        dispatch(setUser(decoded.user));

        // Navigate to dashboard
        if (decoded.role === 1111) {
          navigate('/admindashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ login: "Invalid email or password" });
      }
    } catch (error) {
      setErrors({ login: error.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-black focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-black focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          {errors.login && <p className="text-red-500 text-sm">{errors.login}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;