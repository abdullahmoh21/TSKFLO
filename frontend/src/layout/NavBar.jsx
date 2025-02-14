import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get current location
  const navigation = [
    { name: "About", href: "/about" },
    { name: "User Profile", href: "/dashboard" }, 
    { name: "Log In", href: "/login" },
    { name: "Task Dashboard", href: "/tasks" }

  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 bg-white border-b border-gray-200 shadow-md">
      <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto px-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-500 transition-colors duration-300">
            Task Management
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-8">
          {navigation
            .filter(item => 
              location.pathname !== "/admin" && location.pathname !== "/team" 
              || item.name !== "Log In" && item.name !== "About"
            ) // Hide About and Login on Admin or Team Page
            .map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
