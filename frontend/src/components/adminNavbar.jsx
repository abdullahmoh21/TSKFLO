// AdminNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaEnvelope,
  FaChartBar,
  FaBars,
  FaTimes,
  FaBell,
  FaUsers,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectCurrentUserName } from "../features/auth/authSlice";
import { useGetMyDataQuery } from "../features/user/userApiSlice";
import { useNotification } from "../context/NotificationContext";

// Import our new components
import NavLink from "./navigation/NavLink";
import DarkModeToggle from "./navigation/DarkModeToggle";
import UserMenu from "./navigation/UserMenu";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New user registration", isRead: false },
    { id: 2, text: "System maintenance scheduled", isRead: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get user name from Redux state
  const userName = useSelector(selectCurrentUserName);

  // API hooks
  const {
    data: userData,
    isLoading: isUserLoading,
  } = useGetMyDataQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  // Handle navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActivePath = (path) => location.pathname.startsWith(path);

  // Get unread notification count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const { unreadMessages } = useNotification();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 dark:bg-secondary-900/85 backdrop-blur-lg shadow-md"
          : "bg-white dark:bg-secondary-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/admindashboard"
              className="flex items-center gap-2 text-lg font-bold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-300"
            >
              <FaTasks className="h-6 w-6 animate-bounce-light" />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-1">
              <NavLink
                to="/admindashboard"
                label="Dashboard"
                icon={FaChartBar}
                isActive={isActivePath("/admindashboard") && !location.hash.includes("#users") && !location.hash.includes("#tasks")}
              />

              <NavLink
                to="/admindashboard#users"
                label="Users"
                icon={FaUsers}
                isActive={location.hash.includes("#users")}
              />

              <NavLink
                to="/admindashboard#tasks"
                label="Tasks"
                icon={FaTasks}
                isActive={location.hash.includes("#tasks")}
              />

              <NavLink
                to="/messaging"
                label="Messages"
                icon={FaEnvelope}
                isActive={isActivePath("/messaging")}
                badge={unreadMessages}
              />
            </nav>

            {/* User actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <DarkModeToggle />

              {/* User menu */}
              <UserMenu 
                userName={userName} 
                userData={userData}
                isUserLoading={isUserLoading}
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Dark mode toggle (mobile) */}
            <DarkModeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-secondary-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/admindashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActivePath("/admindashboard") && !location.hash
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaChartBar className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </a>
            <a
              href="/admindashboard#users"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.hash === "#users"
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUsers className="h-5 w-5" />
                <span>Users</span>
              </div>
            </a>
            <a
              href="/admindashboard#tasks"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.hash === "#tasks"
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaTasks className="h-5 w-5" />
                <span>Tasks</span>
              </div>
            </a>
            <a
              href="/messaging"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActivePath("/messaging")
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaEnvelope className="h-5 w-5" />
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </div>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
