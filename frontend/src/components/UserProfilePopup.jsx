import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaEdit, FaSave, FaTimesCircle } from "react-icons/fa";
import {
  useUpdateMyDataMutation,
  useGetMyDataQuery,
} from "../features/user/userApiSlice";

const UserProfilePopup = ({ onClose }) => {
  // Directly fetch user data with RTK Query
  const { data: userData, isLoading, error } = useGetMyDataQuery();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form refs for focus management
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Get update mutation
  const [updateMyData, { isLoading: isUpdating }] = useUpdateMyDataMutation();

  // Initialize form data when user data changes - only once when data arrives
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For phone field, only accept numeric values
    if (name === "phone" && value !== "" && !/^\d+$/.test(value)) {
      return; // Don't update if non-numeric value is entered for phone
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

    // Schedule focus for after the render
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form data to current user data
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Create updates object with all changed fields
      const updates = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== userData[key]) {
          updates[key] = formData[key];
        }
      });

      // Don't submit if nothing changed
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      console.log("Updating with:", updates); // Debug log
      const result = await updateMyData(updates).unwrap();
      console.log("Update response:", result); // Debug log
      setUpdateSuccess(true);
      setIsEditing(false);

      // Success message will disappear after 3 seconds
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-96 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FaTimes className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">User Profile</h2>
        {isLoading ? (
          <div className="text-center py-4 text-secondary-700 dark:text-secondary-300">
            Loading user data...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4 bg-red-50 dark:bg-red-900/20 rounded">
            Error loading user data:{" "}
            {error?.data?.message || "Please try again later."}
          </div>
        ) : userData ? (
          <>
            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                Profile updated successfully!
              </div>
            )}
            {updateError && (
              <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
                {updateError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your phone number (digits only)"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white dark:bg-secondary-700 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <FaSave className="h-4 w-4" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white dark:bg-secondary-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaTimesCircle className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 bg-white dark:bg-secondary-800 rounded p-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Name</label>
                  <p className="font-medium text-secondary-900 dark:text-white text-lg">
                    {userData.name || "Not available"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="font-medium text-secondary-900 dark:text-white text-lg">
                    {userData.email || "Not available"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Phone</label>
                  <p className="font-medium text-secondary-900 dark:text-white text-lg">
                    {userData.phone || "Not provided"}
                  </p>
                </div>
                <button
                  onClick={startEditing}
                  className="mt-4 flex items-center gap-1 px-4 py-2 bg-white dark:bg-secondary-700 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full justify-center"
                >
                  <FaEdit className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-secondary-700 dark:text-secondary-300">
            No user data available
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePopup;
