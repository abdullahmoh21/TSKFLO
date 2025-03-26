import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaExclamationCircle,
  FaSpinner,
  FaSave,
  FaUser,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import {
  useUpdateTaskMutation,
  useAddAssigneeMutation,
  useRemoveAssigneeMutation,
} from "../features/tasks/taskApiSlice";
import { useSearchUsersQuery } from "../features/user/userApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../features/auth/authSlice";

// Maximum description length as defined by the backend
const MAX_DESCRIPTION_LENGTH = 500;

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }) => {
  const userId = useSelector(selectCurrentUserId);
  const isOwner = task?.owner?._id === userId;

  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "Incomplete",
  });

  // Add state to track original task data for comparison
  const [originalTaskData, setOriginalTaskData] = useState({});

  // Initialize selectedAssignees state
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // API mutations
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [addAssignee, { isLoading: isAddingAssignee }] =
    useAddAssigneeMutation();
  const [removeAssignee, { isLoading: isRemovingAssignee }] =
    useRemoveAssigneeMutation();

  // Search users query
  const { data: searchResults = { users: [] }, isLoading: isSearching } =
    useSearchUsersQuery(debouncedQuery, {
      skip: !debouncedQuery || debouncedQuery.length < 2,
    });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 2) {
        setDebouncedQuery(searchQuery);
      } else {
        setDebouncedQuery("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update form when task changes
  useEffect(() => {
    if (task) {
      // Format date to YYYY-MM-DD for the date input
      const formattedDate = task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "";

      const newTaskData = {
        title: task.title || "",
        description: task.description || "",
        dueDate: formattedDate,
        priority: task.priority || "medium",
        status: task.status || "Incomplete",
      };

      setTaskData(newTaskData);
      // Store the original data for later comparison
      setOriginalTaskData(newTaskData);

      // Set assignees if they exist
      setSelectedAssignees(task.assignees || []);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If description field, check length limit
    if (name === "description" && value.length > MAX_DESCRIPTION_LENGTH) {
      return; // Don't update if exceeding max length
    }

    setTaskData({ ...taskData, [name]: value });
  };

  // Function to handle removing assignees
  const handleRemoveAssignee = useCallback(
    async (assigneeId) => {
      if (!isOwner) return;

      try {
        await removeAssignee({
          taskId: task._id,
          assigneeId,
        }).unwrap();

        // Update local state
        setSelectedAssignees((prev) =>
          prev.filter((a) => a._id !== assigneeId)
        );

        setNotification({
          type: "success",
          message: "Assignee removed successfully",
        });
        setTimeout(() => setNotification(null), 2000);
      } catch (err) {
        setErrorMessage(
          err?.data?.message || "Failed to remove assignee. Please try again."
        );
        setTimeout(() => setErrorMessage(null), 3000);
      }
    },
    [isOwner, removeAssignee, task?._id]
  );

  // Function to handle adding assignees
  const handleAddAssignee = useCallback(
    async (user) => {
      if (!isOwner) return;

      // Check if already assigned
      if (selectedAssignees.some((a) => a._id === user._id)) {
        setErrorMessage("User is already assigned to this task");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      try {
        await addAssignee({
          taskId: task._id,
          assigneeId: user._id,
        }).unwrap();

        // Update local state
        setSelectedAssignees((prev) => [...prev, user]);

        // Clear search
        setSearchQuery("");
        setShowDropdown(false);

        setNotification({
          type: "success",
          message: "Assignee added successfully",
        });
        setTimeout(() => setNotification(null), 2000);
      } catch (err) {
        setErrorMessage(
          err?.data?.message || "Failed to add assignee. Please try again."
        );
        setTimeout(() => setErrorMessage(null), 3000);
      }
    },
    [isOwner, addAssignee, task?._id, selectedAssignees]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (taskData.description.length > MAX_DESCRIPTION_LENGTH) {
      setErrorMessage(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
      );
      return;
    }

    try {
      // Create base payload with task ID
      const payload = { taskId: task._id };

      // Only include fields that have actually changed
      if (taskData.title !== originalTaskData.title) {
        payload.title = taskData.title;
      }

      if (taskData.description !== originalTaskData.description) {
        payload.description = taskData.description;
      }

      if (taskData.dueDate !== originalTaskData.dueDate) {
        payload.dueDate = taskData.dueDate;
      }

      if (
        taskData.priority.toLowerCase() !==
        originalTaskData.priority.toLowerCase()
      ) {
        payload.priority = taskData.priority.toLowerCase();
      }

      if (taskData.status !== originalTaskData.status) {
        payload.status = taskData.status;
      }

      // Only proceed with update if there are changes to send
      if (Object.keys(payload).length > 1) {
        // More than just taskId
        await updateTask(payload).unwrap();

        // Show success notification
        setNotification({
          type: "success",
          message: "Task updated successfully!",
        });

        // Notify parent component and close after a brief delay
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        // No changes detected
        setNotification({
          type: "info",
          message: "No changes to save",
        });
        setTimeout(() => {
          setNotification(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(
        err?.data?.message || "Failed to update task. Please try again."
      );
    }
  };

  if (!isOpen || !task) return null;

  const descriptionCharsLeft =
    MAX_DESCRIPTION_LENGTH - taskData.description.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Edit Task
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 p-3 rounded-lg text-sm mb-4 animate-pulse">
              <FaExclamationCircle className="inline mr-2" />
              {errorMessage}
            </div>
          )}

          {/* Success Notification */}
          {notification && notification.type === "success" && (
            <div className="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 p-3 rounded-lg text-sm mb-4 animate-pulse">
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
              >
                Task Title <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Enter task title..."
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={taskData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                placeholder="Enter task description..."
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    descriptionCharsLeft < 50
                      ? "text-danger-500"
                      : "text-secondary-500 dark:text-secondary-400"
                  }`}
                >
                  {descriptionCharsLeft} characters remaining
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
                >
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={taskData.dueDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={taskData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="Incomplete">To Do</option>
                  <option value="Complete">Done</option>
                </select>
              </div>
            </div>

            {/* Owner Information */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Owner
              </label>
              <div className="flex items-center gap-2 py-2 px-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <FaUser className="text-primary-500 dark:text-primary-400" />
                <span className="text-secondary-800 dark:text-secondary-200">
                  {task.owner ? task.owner.name : "Unknown"}
                </span>
              </div>
            </div>

            {/* Assignees Information */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Assignees
                </label>
              </div>

              {/* Current assignees */}
              {selectedAssignees && selectedAssignees.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedAssignees.map((assignee) => (
                    <div
                      key={assignee._id}
                      className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 py-1 px-2 rounded-lg text-sm"
                    >
                      <FaUser className="text-xs" />
                      <span>{assignee.name}</span>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignee(assignee._id)}
                          className="ml-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                          disabled={isRemovingAssignee}
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                  No assignees
                </p>
              )}

              {/* Search users input for owners only */}
              {isOwner && (
                <div className="mt-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-secondary-400 dark:text-secondary-600" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                          setShowDropdown(true);
                        } else {
                          setShowDropdown(false);
                        }
                      }}
                      placeholder="Search for users to assign"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-secondary-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    />
                    {/* Search results dropdown - Fixed positioning */}
                    {showDropdown &&
                      debouncedQuery &&
                      debouncedQuery.length >= 2 && (
                        <div className="absolute z-50 w-full bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 max-h-60 overflow-y-auto top-full left-0 mt-1">
                          {isSearching ? (
                            <div className="p-3 text-center text-secondary-600 dark:text-secondary-400">
                              <FaSpinner className="animate-spin inline mr-2" />
                              Searching users...
                            </div>
                          ) : searchResults.users &&
                            searchResults.users.length > 0 ? (
                            <ul className="py-1">
                              {searchResults.users
                                .filter(
                                  (user) =>
                                    !selectedAssignees.some(
                                      (a) => a._id === user._id
                                    )
                                )
                                .map((user) => (
                                  <li
                                    key={user._id}
                                    className="px-3 py-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer flex items-center justify-between"
                                    onClick={() => {
                                      handleAddAssignee(user);
                                      // Close dropdown after selection
                                      setShowDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
                                        {user.name
                                          ? user.name.charAt(0).toUpperCase()
                                          : "U"}
                                      </div>
                                      <div>
                                        <div className="font-medium text-secondary-900 dark:text-white">
                                          {user.name || "User"}
                                        </div>
                                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                          {user.email || ""}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="ml-2 p-1.5 rounded-full bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-800/50 text-primary-600 dark:text-primary-400"
                                    >
                                      <FaPlus size={10} />
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <div className="p-3 text-center text-secondary-600 dark:text-secondary-400">
                              No users found
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400">
                    Type at least 2 characters to search for users
                  </p>
                </div>
              )}

              {/* Note for non-owners */}
              {!isOwner && (
                <div className="mt-2 p-2.5 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 italic">
                    Note: Only task owners can edit assignees and delete tasks.
                    This task is owned by {task.owner?.name || "another user"}.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isAddingAssignee || isRemovingAssignee}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
