import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaSearch,
  FaTimes,
  FaCheck,
  FaUsers,
  FaArrowLeft,
  FaInfoCircle,
  FaLightbulb,
} from "react-icons/fa";
import {
  useCreateTaskMutation,
  useGetUsersQuery,
} from "../features/tasks/taskApiSlice";
import { useSearchUsersQuery } from "../features/user/userApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../features/auth/authSlice";

// Maximum length constants
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const CreateTask = ({ isModal = false, onClose }) => {
  const navigate = useNavigate();
  const userId = useSelector(selectCurrentUserId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignees: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // API hooks
  const [createTaskMutation] = useCreateTaskMutation();
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchUsersQuery(debouncedQuery, {
      skip: !debouncedQuery || debouncedQuery.length < 2,
    });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(assigneeQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [assigneeQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUserSelect = (user) => {
    if (!formData.assignees.find((a) => a._id === user._id)) {
      setFormData((prev) => ({
        ...prev,
        assignees: [...prev.assignees, user],
      }));
    }

    setAssigneeQuery("");
    setShowAssigneeDropdown(false);
  };

  const removeUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((user) => user._id !== userId),
    }));
  };

  const handleAssigneeChange = (e) => {
    setAssigneeQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowAssigneeDropdown(true);
    } else {
      setShowAssigneeDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.dueDate) errors.dueDate = "Due date is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Prepare data - make sure it matches what the backend expects
      const payload = {
        title: formData.title,
        description: formData.description || "",
        dueDate: formData.dueDate,
        priority: formData.priority,
        assignees: formData.assignees.map((user) => user._id), // Changed to 'assignees' to match backend API
      };

      console.log("Submitting task:", payload);

      // Make the API call
      const result = await createTaskMutation(payload).unwrap();
      console.log("Task creation result:", result);

      // Show success alert
      alert("Task created successfully!");

      // Simple success behavior - just redirect
      if (isModal && onClose) {
        onClose();
      } else {
        // Use navigate to maintain session state
        try {
          navigate("/dashboard");
        } catch (error) {
          console.error("Navigation error:", error);
          // Only as a fallback, and use href instead of replace to be gentler
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      console.error("Task creation error:", err);
      // Show a more informative error message
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Failed to create task. Please try again.";
      alert(errorMessage);

      // Update form errors for display
      setFormErrors({
        ...formErrors,
        general: errorMessage,
      });
    }
  };

  const getCharacterCountColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 70) return "text-success-600 dark:text-success-400";
    if (percentage < 90) return "text-warning-600 dark:text-warning-400";
    return "text-danger-600 dark:text-danger-400";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page title - fixed position to ensure visibility */}
        <div className="mb-8 sticky top-0 pt-4 pb-2 bg-white dark:bg-secondary-900 z-10"></div>

        {/* Main form */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Form header with tips */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
            <div className="flex items-start">
              <FaLightbulb className="text-yellow-300 text-xl mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg">
                  Tips for Effective Tasks
                </h3>
                <ul className="mt-2 text-sm space-y-1 text-primary-100">
                  <li>• Use clear, action-oriented titles</li>
                  <li>• Set realistic due dates</li>
                  <li>• Add sufficient details in the description</li>
                  <li>• Assign to relevant team members</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error display for top-level errors */}
            {formErrors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200 p-4 rounded-lg">
                {formErrors.general}
              </div>
            )}

            {/* Title field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-secondary-900 dark:text-white"
                >
                  Task Title <span className="text-danger-600">*</span>
                </label>
                <span
                  className={`text-xs ${getCharacterCountColor(
                    formData.title.length,
                    MAX_TITLE_LENGTH
                  )}`}
                >
                  {formData.title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a concise task title"
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.title
                    ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500"
                    : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
                } bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white text-base placeholder:text-secondary-400`}
                required
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Description field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-secondary-900 dark:text-white"
                >
                  Description
                </label>
                <span
                  className={`text-xs ${getCharacterCountColor(
                    formData.description.length,
                    MAX_DESCRIPTION_LENGTH
                  )}`}
                >
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the task"
                rows="4"
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.description
                    ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500"
                    : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
                } bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white text-base placeholder:text-secondary-400 resize-none`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Due date and Priority in 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due date field */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-secondary-900 dark:text-white mb-2"
                >
                  Due Date <span className="text-danger-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-secondary-400 dark:text-secondary-600" />
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formErrors.dueDate
                        ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500"
                        : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
                    } bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white`}
                    required
                  />
                </div>
                {formErrors.dueDate && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {formErrors.dueDate}
                  </p>
                )}
              </div>

              {/* Priority field */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-secondary-900 dark:text-white mb-2"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label
                htmlFor="assignees"
                className="block text-sm font-medium text-secondary-900 dark:text-white mb-2"
              >
                Assign To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-secondary-400 dark:text-secondary-600" />
                </div>
                <input
                  type="text"
                  id="assignees"
                  value={assigneeQuery}
                  onChange={handleAssigneeChange}
                  placeholder="Search for users to assign"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white"
                />
                {/* Search results dropdown */}
                {showAssigneeDropdown &&
                  debouncedQuery &&
                  debouncedQuery.length > 1 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-secondary-600 dark:text-secondary-400">
                          Searching users...
                        </div>
                      ) : searchResults?.users &&
                        searchResults.users.length > 0 ? (
                        <ul>
                          {searchResults.users
                            .filter((user) => user._id !== userId)
                            .map((user) => (
                              <li
                                key={user._id}
                                className="px-4 py-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer flex items-center"
                                onClick={() => handleUserSelect(user)}
                              >
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
                                  {user.username
                                    ? user.username.charAt(0).toUpperCase()
                                    : user.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {user.username || user.name || "User"}
                                  </div>
                                  <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                    {user.email || ""}
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-secondary-600 dark:text-secondary-400">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Selected assignees */}
              {formData.assignees.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.assignees.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full px-3 py-1"
                    >
                      <span className="mr-1">
                        {user.username || user.name || user.fullName || "User"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUser(user._id)}
                        className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                onClick={() => (window.location.href = "/dashboard")}
                className="px-5 py-3 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                <FaCheck className="mr-2" />
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
