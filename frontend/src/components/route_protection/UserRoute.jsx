import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../../features/auth/authSlice";
import { FaSpinner } from "react-icons/fa";

const UserRoute = () => {
  const token = useSelector(selectCurrentToken);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in Redux store first
    if (token) {
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      return;
    }
    // Authentication check is complete
    setIsCheckingAuth(false);
  }, [token]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the outlet (child routes) if authenticated
  return <Outlet />;
};

export default UserRoute;
