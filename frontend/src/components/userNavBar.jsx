// UserDashNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaUserCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaPlus,
  FaBell,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUserName, logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { useGetMyDataQuery } from "../features/user/userApiSlice";
import UserProfilePopup from "./UserProfilePopup";
import NotificationPanel from "./NotificationPanel";
import { useNotification } from "../context/NotificationContext";

const UserDashNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user name from Redux state
  const userName = useSelector(selectCurrentUserName);

  // API hooks
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
    isError: hasError,
    isSuccess: isDataLoaded,
  } = useGetMyDataQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  // Local state
  const [showPopup, setShowPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New task assigned to you", isRead: false },
    { id: 2, text: "Task deadline approaching", isRead: false },
  ]);

  // Handle dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      // First, manually dispatch the logout action to clear the Redux state
      dispatch(logOut());

      // Then call the logout endpoint
      const result = await logout().unwrap();
      console.log("Logout API response:", result);

      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // If the API call fails, we still want to log out locally
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

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
              to="/dashboard"
              className="flex items-center gap-2 text-lg font-bold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-300"
            >
              <FaTasks className="h-5 w-5 animate-bounce-light" />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Task Management
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover-lift flex items-center ${
                  isActivePath("/dashboard")
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/messaging"
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover-lift flex items-center gap-1 ${
                  isActivePath("/messaging")
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                }`}
              >
                <FaEnvelope className="h-3.5 w-3.5" />
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            </nav>

            {/* User actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400 h-8 w-8 flex items-center justify-center"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <FaSun className="h-4 w-4 text-warning-400" />
                ) : (
                  <FaMoon className="h-4 w-4" />
                )}
              </button>

              {/* User profile dropdown trigger */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 h-8"
                  onClick={() => setShowPopup(true)}
                >
                  <span className="hidden md:inline-block">
                    {isUserLoading
                      ? "Loading..."
                      : hasError
                      ? "Error loading user"
                      : userData?.name
                      ? userData.name
                      : userName || "User"}
                  </span>
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 overflow-hidden">
                    <FaUserCircle className="h-5 w-5" />
                  </div>
                </button>
              </div>

              {/* Logout button on larger screens */}
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 h-8"
              >
                <FaSignOutAlt className="h-3.5 w-3.5" />
                <span>{isLogoutLoading ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation - shown on small screens */}
      <div className="md:hidden border-t border-secondary-100 dark:border-secondary-800">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center px-4 py-1 ${
              isActivePath("/dashboard")
                ? "text-primary-600 dark:text-primary-400"
                : "text-secondary-600 dark:text-secondary-400"
            }`}
          >
            <FaTasks className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>

          <Link
            to="/create-task"
            className={`flex flex-col items-center px-4 py-1 ${
              isActivePath("/create-task")
                ? "text-primary-600 dark:text-primary-400"
                : "text-secondary-600 dark:text-secondary-400"
            }`}
          >
            <FaPlus className="h-5 w-5" />
            <span className="text-xs mt-1">New Task</span>
          </Link>

          <Link
            to="/messaging"
            className={`flex flex-col items-center px-4 py-1 relative ${
              isActivePath("/messaging")
                ? "text-primary-600 dark:text-primary-400"
                : "text-secondary-600 dark:text-secondary-400"
            }`}
          >
            <FaEnvelope className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center px-4 py-1 text-secondary-600 dark:text-secondary-400"
          >
            <FaSignOutAlt className="h-5 w-5" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>

      {showPopup && <UserProfilePopup onClose={handleClosePopup} />}
    </header>
  );
};

export default UserDashNavbar;
