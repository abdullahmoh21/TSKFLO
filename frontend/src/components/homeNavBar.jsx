// HomeNavbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTasks, FaUserCircle } from "react-icons/fa";

const HomeNavbar = () => {
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/"
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
                to="/about"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath("/about")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                About
              </Link>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath("/login")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
