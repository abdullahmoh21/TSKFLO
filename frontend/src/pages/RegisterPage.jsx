import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRegisterMutation } from "../features/auth/authApiSlice";
import { FaTasks, FaLock, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useParams();

  // RTK Query register mutation
  const [register, { isLoading }] = useRegisterMutation();

  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple client-side validation
    let newErrors = {};
    if (!password) {
      newErrors.password = "Please enter your password.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      // Call the RTK Query register mutation
      await register({ token, password }).unwrap();

      // Show success toast
      toast.success('Registration successful! Redirecting to login...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Delay navigation to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error?.data?.message || "Registration failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setErrors({ register: error?.data?.message || "Registration failed. Please try again." });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            <p className="text-white/80">Complete your registration</p>
          </div>
          
          {/* Glass morphism card */}
          <div className="glass-morphism rounded-2xl p-8 shadow-glass">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
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

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-primary-300" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border-0 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-primary-400 focus:bg-white/20 transition-all ${
                        errors.confirmPassword ? "ring-2 ring-danger-500" : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-danger-300 text-sm mt-1 animate-pulse">{errors.confirmPassword}</p>
                  )}
                </div>
                
                {errors.register && (
                  <div className="bg-danger-500/20 text-danger-300 p-3 rounded-lg text-sm animate-pulse">
                    {errors.register}
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
                      Registering...
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </div>
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

export default RegisterPage; 