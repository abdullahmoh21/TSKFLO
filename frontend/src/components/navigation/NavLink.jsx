import React from "react";
import { Link } from "react-router-dom";

/**
 * Reusable navigation link component with active state support
 */
const NavLink = ({
  to,
  label,
  icon: Icon,
  isActive,
  badge,
  onClick,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift relative ${
        isActive
          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
          : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </span>

      {badge && badge > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
};

export default NavLink; 