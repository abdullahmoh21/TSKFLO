// UserDashNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTasks, FaUserCircle, FaEnvelope } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUserName, logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { useGetMyDataQuery } from "../features/user/userApiSlice";
import UserProfilePopup from "./UserProfilePopup";

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-lg font-bold text-blue-500 hover:text-blue-600 transition-colors duration-300"
            >
              <FaTasks className="h-6 w-6" />
              <span>Task Management</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath("/dashboard")
                    ? "bg-blue-50 text-blue-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-500"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/messaging"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActivePath("/messaging")
                    ? "bg-blue-50 text-blue-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-500"
                }`}
              >
                <FaEnvelope className="h-4 w-4" />
                <span>Messages</span>
              </Link>
            </nav>

            {/* User Profile & Logout Button */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <button
                onClick={() => setShowPopup(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200 border border-gray-200"
                disabled={isUserLoading}
              >
                <FaUserCircle className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-black">
                  {isUserLoading
                    ? "Loading..."
                    : hasError
                    ? "Error loading user"
                    : userData?.name
                    ? userData.name
                    : userName || "User"}
                </span>
              </button>
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="px-4 py-2 text-sm font-medium bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                {isLogoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render the profile popup when showPopup is true */}
      {showPopup && <UserProfilePopup onClose={handleClosePopup} />}
    </header>
  );
};

export default UserDashNavbar;
