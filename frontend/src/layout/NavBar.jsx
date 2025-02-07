import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navigation = [
    { name: "About", href: "/about" },
    { name: "Log In", href: "/login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold text-gray-900">
            Task Management
          </Link>
        </div>
        <nav className="flex gap-8">
          {navigation.map((item, itemIdx) => (
            <Link
              key={itemIdx}
              to={item.href} // Make sure this is using "to", not "href"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-300"
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
