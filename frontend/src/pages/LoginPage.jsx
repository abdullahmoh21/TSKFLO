import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useGetUserProfileQuery } from "../features/auth/authApiSlice"; // <-- RTK Query Hook
import { setCredentials } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // RTK Query login mutation
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("In handle Submit");
    // Simple client-side validation
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
      console.log();
      // Call the RTK Query login mutation
      const { accessToken } = await login({ email, password }).unwrap();
      console.log("Your JWT Token:", accessToken);

      // Dispatch the token to Redux state (authSlice will decode it)
      dispatch(setCredentials({ accessToken }));

      // Optionally decode here if you want immediate access to role, email, etc.
      const decoded = jwtDecode(accessToken);
      console.log("Decoded Token:", decoded);

      // Force fetch the user profile after login
      try {
        // This will get the user's profile information
        const response = await fetch("http://localhost:3200/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User data fetched:", userData);
        }
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Navigate based on role
      if (decoded?.user?.role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ login: error?.data?.message || "Invalid email or password" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-black focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-black focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {errors.login && (
            <p className="text-red-500 text-sm">{errors.login}</p>
          )}
          <button
            type="submit"
            disabled={isLoading} // optional if you want to disable the button while loading
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
