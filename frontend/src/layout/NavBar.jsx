import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaTasks, FaUserCircle } from 'react-icons/fa';
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const publicNavigation = [
    { name: "About", href: "/about" },
    { name: "Login", href: "/login" }
  ];
  const privateNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Create Task", href: "/create-task" }
  ];
  const handleLogout = () => {
    logout();
  };
  const isActivePath = (path) => {
    return location.pathname === path;
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-
gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-bold text-blue-600
hover:text-blue-700 transition-colors duration-300"
            >
              <FaTasks className="h-6 w-6" />
              <span>Task Management</span>
            </Link>
          </div>
          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {isAuthenticated
                ? privateNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium
transition-colors duration-200 ${isActivePath(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))
                : publicNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium
transition-colors duration-200 ${isActivePath(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
            </nav>
            {isAuthenticated && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-
gray-200">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-
red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
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