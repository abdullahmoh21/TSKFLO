import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApiSlice"; // <-- RTK Query Hook
import { setCredentials } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { FaTasks, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // RTK Query login mutation
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

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

      // Dispatch the token to Redux state (authSlice will decode it)
      dispatch(setCredentials({ accessToken }));

      const decoded = jwtDecode(accessToken);
      console.log("Decoded Token:", decoded);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-secondary-800 animate-background bg-[length:200%_200%]"></div>
      
      {/* Animated circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div 
          className={`w-full max-w-md transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          {/* Logo and brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <FaTasks className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-white/80">Sign in to your account</p>
          </div>
          
          {/* Glass morphism card */}
          <div className="glass-morphism rounded-2xl p-8 shadow-glass">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-primary-300" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border-0 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-primary-400 focus:bg-white/20 transition-all ${
                      errors.email ? "ring-2 ring-danger-500" : ""
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-danger-300 text-sm mt-1 animate-pulse">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-primary-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border-0 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-primary-400 focus:bg-white/20 transition-all ${
                      errors.password ? "ring-2 ring-danger-500" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger-300 text-sm mt-1 animate-pulse">{errors.password}</p>
                )}
              </div>
              
              {errors.login && (
                <div className="bg-danger-500/20 text-danger-300 p-3 rounded-lg text-sm animate-pulse">
                  {errors.login}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-primary-500/30"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} Task Management. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
