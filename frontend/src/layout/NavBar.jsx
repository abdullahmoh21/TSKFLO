import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaTasks, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  // Debugging logs
  useEffect(() => {
    console.log("User Data:", user);
    console.log("Current Location:", location.pathname);
  }, [location, user]);

  // If authentication data is still loading, prevent rendering
  if (!isAuthenticated || user === null) return null;

  // Public navigation (for non-authenticated users)
  const publicNavigation = [
    { name: "About", href: "/about" },
    { name: "Login", href: "/login" }
  ];

  // Navigation for regular authenticated users
  const privateNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Create Task", href: "/create-task" }
  ];

  // Navigation for admin (only when on /admindashboard)
  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admindashboard" }
  ];

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path) => location.pathname === path;

  // Determine navigation links based on user role and current location
  const navigationItems = () => {
    if (!isAuthenticated) return publicNavigation;

    if (user?.role === "admin" && location.pathname === "/admindashboard") {
      // If the user is an admin and on the admin dashboard route, show adminNavigation only.
      return adminNavigation;
    }

    // For non-admin users, and admin users on non-admin pages, show the privateNavigation.
    return privateNavigation;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to={user?.isAdmin ? "/admindashboard" : "/"}
              className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors duration-300"
            >
              <FaTasks className="h-6 w-6" />
              <span>Task Management</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {navigationItems().map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Profile & Logout Button */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'} {user?.isAdmin ? '(Admin)' : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
