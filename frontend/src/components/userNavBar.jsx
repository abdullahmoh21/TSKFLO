// UserDashNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaUserCircle,
  FaEnvelope,
  FaTimes,
  FaEdit,
  FaSave,
  FaTimesCircle,
} from "react-icons/fa";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import {
  useGetMyDataQuery,
  useUpdateMyDataMutation,
} from "../features/user/userApiSlice";
import { useDispatch } from "react-redux";
import { logOut } from "../features/auth/authSlice";

const UserDashNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
    isError: hasError,
    isSuccess: isDataLoaded,
  } = useGetMyDataQuery(undefined, {
    // If you don’t want to refetch while editing, you can set this to false:
    refetchOnMountOrArgChange: false
   // refetchOnMountOrArgChange: true,
  });
  const [updateMyData, { isLoading: isUpdating }] = useUpdateMyDataMutation();

  // Refs for focusing when editing begins
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Local state
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Log userData or errors (optional debug)
  useEffect(() => {
    if (userData) {
      console.log("User data received:", userData);
    }
    if (userError) {
      console.error("Error fetching user data:", userError);
    }
  }, [userData, userError]);

  /**
   * IMPORTANT FIX:
   * Only set formData from userData if we're NOT editing.
   * Otherwise, we'll overwrite typed input on each keystroke.
   */
  useEffect(() => {
    if (userData && !isEditing) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData, isEditing]);

  // Input change handler (prevents non-numeric phone input)
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && value !== "" && !/^\d+$/.test(value)) {
      return; // ignore non-digit input for phone
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    // Focus the name input after next render
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    // Optionally reset form data to whatever userData is right now:
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Only send fields that actually changed
      const updates = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== userData[key]) {
          updates[key] = formData[key];
        }
      });

      // If nothing changed, just exit edit mode
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      console.log("Updating with:", updates);
      await updateMyData(updates).unwrap();
      setUpdateSuccess(true);
      setIsEditing(false);

      // Disappear success message after 3s
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to update user data:", error);
      setUpdateError(
        error?.data?.message ||
          "Failed to update your information. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOut());
      await logout().unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  const isActivePath = (path) => location.pathname === path;

  // Popup component
  const UserProfilePopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative shadow-xl">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-black">User Profile</h2>

        {isUserLoading ? (
          <div className="text-center py-4 text-black">Loading user data...</div>
        ) : hasError ? (
          <div className="text-red-500 text-center py-4 bg-red-50 rounded">
            Error loading user data:{" "}
            {userError?.data?.message || "Please try again later."}
          </div>
        ) : isDataLoaded && userData ? (
          <>
            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
                Profile updated successfully!
              </div>
            )}
            {updateError && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
                {updateError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your phone number (digits only)"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
                  >
                    <FaSave className="h-4 w-4" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    <FaTimesCircle className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 bg-white rounded p-4">
                <div>
                  <label className="block text-sm text-gray-600">Name</label>
                  <p className="font-medium text-black text-lg">
                    {userData.name || "Not available"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <p className="font-medium text-black text-lg">
                    {userData.email || "Not available"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Phone</label>
                  <p className="font-medium text-black text-lg">
                    {userData.phone || "Not provided"}
                  </p>
                </div>

                <button
                  onClick={startEditing}
                  className="mt-4 flex items-center gap-1 px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors w-full justify-center"
                >
                  <FaEdit className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-black">No user data available</div>
        )}
      </div>
    </div>
  );

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

          {/* Navigation */}
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

            {/* User Profile & Logout */}
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
                    : "User"}
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

      {showPopup && <UserProfilePopup />}
    </header>
  );
};

export default UserDashNavbar;
