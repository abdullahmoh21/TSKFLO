// AdminDashNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaUserCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaChartBar,
  FaBars,
  FaTimes,
  FaBell,
  FaUsers,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUserName, logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { useGetMyDataQuery } from "../features/user/userApiSlice";
import UserProfilePopup from "./UserProfilePopup";
import { useNotification } from "../context/NotificationContext";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New user registration", isRead: false },
    { id: 2, text: "System maintenance scheduled", isRead: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Get user name from Redux state
  const userName = useSelector(selectCurrentUserName);

  // API hooks
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const {
    data: userData,
    isLoading: isUserLoading,
  } = useGetMyDataQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

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

  const isActivePath = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      // First, manually dispatch the logout action to clear the Redux state
      dispatch(logOut());

      // Then call the logout endpoint
      await logout().unwrap();

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

  const { unreadMessages } = useNotification();

  const handleClosePopup = () => {
    setShowProfilePopup(false);
  };

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
              <Link
                to="/admindashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                  isActivePath("/admindashboard") && !location.hash.includes("#users") && !location.hash.includes("#tasks")
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FaChartBar className="h-4 w-4" />
                  <span>Dashboard</span>
                </span>
              </Link>

              <Link
                to="/admindashboard#users"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                  location.hash.includes("#users")
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FaUsers className="h-4 w-4" />
                  <span>Users</span>
                </span>
              </Link>

              <Link
                to="/admindashboard#tasks"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                  location.hash.includes("#tasks")
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FaTasks className="h-4 w-4" />
                  <span>Tasks</span>
                </span>
              </Link>

              <Link
                to="/messaging"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover-lift flex items-center gap-1 ${
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
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-warning-400" />
                ) : (
                  <FaMoon className="h-5 w-5" />
                )}
              </button>

              {/* User profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfilePopup(true)}
                  className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800"
                >
                  <span className="hidden md:inline-block">
                    {isUserLoading
                      ? "Loading..."
                      : userData?.name
                      ? userData.name
                      : userName || "Admin"}
                  </span>
                  <FaUserCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors py-2 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Dark mode toggle (mobile) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <FaSun className="h-5 w-5 text-warning-400" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications (mobile) */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
                aria-label="Notifications"
              >
                <FaBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-danger-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              className="p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-60' : 'max-h-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-secondary-200 dark:border-secondary-700">
          <Link
            to="/admindashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath("/admindashboard") && !location.hash.includes("#users") && !location.hash.includes("#tasks")
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex items-center gap-1.5">
              <FaChartBar className="h-4 w-4" />
              <span>Dashboard</span>
            </span>
          </Link>

          <Link
            to="/admindashboard#users"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.hash.includes("#users")
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex items-center gap-1.5">
              <FaUsers className="h-4 w-4" />
              <span>Users</span>
            </span>
          </Link>

          <Link
            to="/admindashboard#tasks"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.hash.includes("#tasks")
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex items-center gap-1.5">
              <FaTasks className="h-4 w-4" />
              <span>Tasks</span>
            </span>
          </Link>

          <Link
            to="/messaging"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath("/messaging")
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex items-center gap-1.5">
              <FaEnvelope className="h-4 w-4" />
              <span>Messages</span>
              {unreadMessages > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </span>
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowProfilePopup(true);
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
          >
            <span className="flex items-center gap-1.5">
              <FaUserCircle className="h-4 w-4" />
              <span>Profile</span>
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
          >
            <span className="flex items-center gap-1.5">
              <FaSignOutAlt className="h-4 w-4" />
              <span>Logout</span>
            </span>
          </button>
        </div>
      </div>

      {/* Profile popup */}
      {showProfilePopup && (
        <UserProfilePopup onClose={handleClosePopup} userData={userData} />
      )}

      {/* Notification panel */}
      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
};

export default AdminNavbar;
