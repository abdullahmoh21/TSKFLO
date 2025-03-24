import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApiSlice";
import UserProfilePopup from "../UserProfilePopup";

/**
 * User menu component with profile popup and logout functionality
 */
const UserMenu = ({ userName, userData, isUserLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

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

  const handleClosePopup = () => {
    setShowProfilePopup(false);
  };

  const displayName = isUserLoading
    ? "Loading..."
    : userData?.name
    ? userData.name
    : userName || "User";

  return (
    <div className="flex items-center gap-2">
      {/* User profile button */}
      <div className="relative">
        <button
          onClick={() => setShowProfilePopup(true)}
          className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800"
        >
          <span className="hidden md:inline-block">{displayName}</span>
          <FaUserCircle className="h-5 w-5" />
        </button>

        {/* Profile popup */}
        {showProfilePopup && (
          <UserProfilePopup onClose={handleClosePopup} />
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="hidden md:flex items-center gap-1.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors py-2 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800"
        disabled={isLogoutLoading}
      >
        <FaSignOutAlt className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserMenu; 