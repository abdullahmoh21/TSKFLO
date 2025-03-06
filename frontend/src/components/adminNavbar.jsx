// AdminDashNavbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTasks, FaUserCircle, FaEnvelope } from "react-icons/fa";

const AdminDashNavbar = () => {
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    // You can wire up your actual logout logic here
    console.log("Logout clicked");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/admindashboard"
              className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors duration-300"
            >
              <FaTasks className="h-6 w-6" />
              <span>Task Management</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              <Link
                to="/admindashboard"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath("/admindashboard")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/messaging"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActivePath("/messaging")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FaEnvelope className="h-4 w-4" />
                <span>Messages</span>
              </Link>
            </nav>

            {/* Admin Profile & Logout Button */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <FaUserCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Admin User
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminDashNavbar;
