import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUserRole } from "../../features/auth/authSlice";

const AdminRoute = () => {
  const userRole = useSelector(selectCurrentUserRole);

  // Check if user is admin
  if (userRole !== "admin") {
    return <Navigate to="/" />;
  }

  // Render outlet for nested routes if user is admin
  return <Outlet />;
};

export default AdminRoute;
