import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaFilter,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimes,
  FaTrash,
  FaSpinner,
  FaEdit,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaExclamationCircle,
  FaUsers,
} from "react-icons/fa";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
} from "../features/tasks/taskApiSlice";
import { useGetMyDataQuery } from "../features/user/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUserId,
  selectCurrentUserName,
} from "../features/auth/authSlice";
import { setUserData } from "../features/auth/authSlice";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    taskRelation: "",
  });

  // state for managing completed tasks visibility
  const [hideCompleted, setHideCompleted] = useState(false);

  // New notification state
  const [notification, setNotification] = useState(null);

  // State for task detail modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Trigger user profile fetch
  const { data: userData, isLoading: isLoadingProfile } = useGetMyDataQuery();

  // Get username and userId from Redux state
  const userName = useSelector(selectCurrentUserName);
  const userId = useSelector(selectCurrentUserId);

  // Fetch tasks data from backend
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTasksQuery();

  useEffect(() => {
    if (userData) {
      dispatch(
        setUserData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
        })
      );
    }
  }, [userData, dispatch]);

  // Delete task mutation
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Rest of the existing functions
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      taskRelation: "",
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();

        // Close modal if the deleted task was being viewed
        if (selectedTask && selectedTask._id === taskId) {
          setShowTaskModal(false);
          setSelectedTask(null);
        }

        // Show success notification
        setNotification({
          type: "success",
          message: "Task deleted successfully!",
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } catch (err) {
        console.error("Failed to delete task:", err);

        // Show error notification
        setNotification({
          type: "error",
          message: err?.data?.message || "Failed to delete task",
        });

        // Hide error notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    // Wait for animation to complete before clearing data
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatStatus = (status) => {
    return status === "Complete" ? "Done" : "To Do";
  };

  // Function to determine the task relationship label (updated for populated fields)
  const getTaskRelationshipLabel = (task) => {
    if (task.owner && task.owner._id === userId) {
      return (
        <div className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
          <FaUser className="text-blue-500" size={10} />
          Created by you
        </div>
      );
    } else if (
      task.assignees &&
      task.assignees.some((assignee) => assignee._id === userId)
    ) {
      return (
        <div className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
          <FaUsers className="text-purple-500" size={10} />
          Assigned to you by {task.owner?.name || "Unknown"}
        </div>
      );
    } else if (task.assignees && task.assignees.length > 0) {
      return (
        <div className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
          <FaUsers className="text-gray-500" size={10} />
          Created by {task.owner?.name || "Unknown"}
        </div>
      );
    }
    return null;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Check if due date is approaching (within next 3 days)
  const isApproachingDueDate = (dueDate) => {
    if (!dueDate) return false;
    if (isOverdue(dueDate)) return false; // Already overdue

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 3 && diffDays >= 0;
  };

  // Style helpers
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 border-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-100";
      case "low":
        return "text-green-600 bg-green-50 border-green-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "text-green-600 bg-green-50 border-green-100";
      case "Incomplete":
        return "text-gray-600 bg-gray-50 border-gray-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  // Get card background color based on task status and due date
  const getCardBackground = (task) => {
    if (task.status === "Complete") {
      return "bg-green-50 border-green-200";
    }
    if (isOverdue(task.dueDate)) {
      return "bg-red-50 border-red-200";
    }
    if (isApproachingDueDate(task.dueDate)) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-white border-gray-100";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter tasks based on selected filters (updated for populated fields)
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    const statusMatch =
      !filters.status ||
      (filters.status === "Done" && task.status === "Complete") ||
      (filters.status === "To Do" && task.status === "Incomplete");

    // Priority filter
    const priorityMatch =
      !filters.priority || task.priority === filters.priority.toLowerCase();

    // Task relationship filter (updated for populated owner and assignees)
    let relationMatch = true;
    if (filters.taskRelation) {
      if (
        filters.taskRelation === "created" &&
        (!task.owner || task.owner._id !== userId)
      ) {
        relationMatch = false;
      }
      if (
        filters.taskRelation === "assigned" &&
        (!task.assignees ||
          !task.assignees.some((assignee) => assignee._id === userId))
      ) {
        relationMatch = false;
      }
    }

    // Hide completed tasks if option is enabled
    const completionMatch = !hideCompleted || task.status !== "Complete";

    return statusMatch && priorityMatch && relationMatch && completionMatch;
  });

  // Sort tasks by status (incomplete first) and then by due date (closest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by status (incomplete first)
    if (a.status !== b.status) {
      return a.status === "Complete" ? 1 : -1;
    }

    // If both have due dates, sort by closest due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    // If only one has a due date, prioritize it
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // If neither has a due date, sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Get unique values for filter options
  const statusOptions = ["To Do", "Done"];
  const priorityOptions = ["High", "Medium", "Low"];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{userName ? `, ${userName}!` : "!"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your tasks and progress
          </p>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 rounded-md shadow-md p-4 flex items-center ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaTimes className="mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Loading & Error States */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
            <p>Loading your tasks...</p>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="text-red-500 mb-4">
              <FaTimes className="text-3xl mx-auto" />
            </div>
            <p className="text-red-600">
              Error loading tasks:{" "}
              {error?.data?.message || "Something went wrong"}
            </p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Actions Bar */}
        {!isLoading && !isError && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    Total: {filteredTasks.length}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                    To Do:{" "}
                    {
                      filteredTasks.filter((t) => t.status === "Incomplete")
                        .length
                    }
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    Done:{" "}
                    {
                      filteredTasks.filter((t) => t.status === "Complete")
                        .length
                    }
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setHideCompleted(!hideCompleted)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    hideCompleted
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {hideCompleted ? (
                    <FaEyeSlash className="mr-2" />
                  ) : (
                    <FaEye className="mr-2" />
                  )}
                  {hideCompleted ? "Show Completed" : "Hide Completed"}
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    showFilters
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaFilter className="mr-2" />
                  Filter
                </button>
                <Link
                  to="/create-task"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaPlus className="mr-2" />
                  New Task
                </Link>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                  {(filters.status ||
                    filters.priority ||
                    filters.taskRelation) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Priorities</option>
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Relation
                    </label>
                    <select
                      value={filters.taskRelation}
                      onChange={(e) =>
                        handleFilterChange("taskRelation", e.target.value)
                      }
                      className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Tasks</option>
                      <option value="created">Created by me</option>
                      <option value="assigned">Assigned to me</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Grid */}
        {!isLoading && !isError && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {filteredTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow duration-200 ${getCardBackground(
                    task
                  )} cursor-pointer`}
                  onClick={() => openTaskDetail(task)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          task.status === "Complete"
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/edit-task/${task._id}`}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        >
                          <FaEdit className="text-sm" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task._id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                          disabled={isDeleting}
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Task Relationship - Updated for populated fields */}
                    {getTaskRelationshipLabel(task)}

                    <p
                      className={`text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px] ${
                        task.status === "Complete"
                          ? "line-through text-gray-400"
                          : ""
                      }`}
                    >
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === "Complete" ? (
                          <FaCheckCircle className="mr-1" />
                        ) : null}
                        {formatStatus(task.status)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {formatPriority(task.priority)}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                            isOverdue(task.dueDate)
                              ? "bg-red-100 text-red-700"
                              : isApproachingDueDate(task.dueDate)
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isOverdue(task.dueDate) ? (
                            <FaExclamationTriangle className="mr-1" />
                          ) : (
                            <FaClock className="mr-1" />
                          )}
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && (
                            <span className="ml-1 font-bold">(Overdue)</span>
                          )}
                          {isApproachingDueDate(task.dueDate) && (
                            <span className="ml-1">(Soon)</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Assignees - Updated for populated fields */}
                    {task.assignees && task.assignees.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <span
                              key={assignee._id}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                            >
                              {assignee.name || "User"}
                            </span>
                          ))}
                          {task.assignees.length > 3 && (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                              +{task.assignees.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <FaCheckCircle className="text-5xl mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-1">
                  No tasks found
                </h3>
                <p className="text-gray-500 mb-4">
                  {hideCompleted
                    ? "All tasks are completed. Unhide completed tasks or create new ones."
                    : Object.values(filters).some((f) => f !== "")
                    ? "Try changing your filters"
                    : "Create your first task to get started"}
                </p>
                <div className="flex justify-center gap-4">
                  {hideCompleted && (
                    <button
                      onClick={() => setHideCompleted(false)}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FaEye className="mr-2" />
                      Show Completed
                    </button>
                  )}
                  <Link
                    to="/create-task"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaPlus className="mr-2" />
                    New Task
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Detail Modal */}
        {showTaskModal && selectedTask && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={closeTaskModal}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className={`${getCardBackground(selectedTask)} p-6`}>
                  {/* Modal header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3
                      className={`text-xl font-semibold ${
                        selectedTask.status === "Complete"
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                      id="modal-title"
                    >
                      {selectedTask.title}
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={closeTaskModal}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Task Relationship - Updated for populated fields */}
                  {getTaskRelationshipLabel(selectedTask)}

                  {/* Task details */}
                  <div className="space-y-4">
                    {/* Description */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Description
                      </h4>
                      <p
                        className={`text-gray-700 ${
                          selectedTask.status === "Complete"
                            ? "line-through text-gray-400"
                            : ""
                        }`}
                      >
                        {selectedTask.description || "No description provided."}
                      </p>
                    </div>

                    {/* Status and Priority */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Status
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusColor(
                              selectedTask.status
                            )}`}
                          >
                            {selectedTask.status === "Complete" ? (
                              <FaCheckCircle className="mr-1" />
                            ) : null}
                            {formatStatus(selectedTask.status)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Priority
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getPriorityColor(
                              selectedTask.priority
                            )}`}
                          >
                            <FaExclamationCircle className="mr-1" />
                            {formatPriority(selectedTask.priority)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Due Date
                      </h4>
                      {selectedTask.dueDate ? (
                        <div
                          className={`p-2 rounded-md text-sm ${
                            isOverdue(selectedTask.dueDate)
                              ? "bg-red-50 text-red-700"
                              : isApproachingDueDate(selectedTask.dueDate)
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            <span>{formatDate(selectedTask.dueDate)}</span>
                          </div>
                          {isOverdue(selectedTask.dueDate) && (
                            <div className="flex items-center mt-1 font-medium">
                              <FaExclamationTriangle className="mr-1" />
                              <span>This task is overdue!</span>
                            </div>
                          )}
                          {isApproachingDueDate(selectedTask.dueDate) && (
                            <div className="flex items-center mt-1 font-medium">
                              <FaClock className="mr-1" />
                              <span>Due soon!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No due date set</span>
                      )}
                    </div>

                    {/* Assignees Section - Updated for populated fields */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Assignees
                      </h4>
                      {selectedTask.assignees &&
                      selectedTask.assignees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.assignees.map((assignee) => (
                            <span
                              key={assignee._id}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded"
                            >
                              {assignee.name || "Unknown User"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No assignees</p>
                      )}
                    </div>

                    {/* Creation Date */}
                    {selectedTask.createdAt && (
                      <div className="pt-2 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Created
                        </h4>
                        <div className="text-gray-700 flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(selectedTask.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Update Date if available */}
                    {selectedTask.updatedAt &&
                      selectedTask.updatedAt !== selectedTask.createdAt && (
                        <div className="pt-2 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Last Updated
                          </h4>
                          <div className="text-gray-700 flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(selectedTask.updatedAt)}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={closeTaskModal}
                    >
                      Close
                    </button>
                    <Link
                      to={`/edit-task/${selectedTask._id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <FaEdit className="inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(selectedTask._id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTrash className="inline mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
