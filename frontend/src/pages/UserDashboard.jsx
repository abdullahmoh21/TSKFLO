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
} from "react-icons/fa";
import { useGetTasksQuery, useDeleteTaskMutation } from "../features/tasks/taskApiSlice";
import { useGetUserProfileQuery } from "../features/auth/authApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserName } from "../features/auth/authSlice";

const TaskDashboard = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });
  
  // New state for managing completed tasks visibility
  const [hideCompleted, setHideCompleted] = useState(false);
  
  // New notification state
  const [notification, setNotification] = useState(null);
  
  // Trigger user profile fetch
  const { isLoading: isLoadingProfile } = useGetUserProfileQuery();
  
  // Get username from Redux state
  const userName = useSelector(selectCurrentUserName);
  
  // Fetch tasks data from backend
  const { 
    data: tasks = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetTasksQuery();
  
  // Delete task mutation
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

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
    });
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();
        
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Task deleted successfully!'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } catch (err) {
        console.error("Failed to delete task:", err);
        
        // Show error notification
        setNotification({
          type: 'error',
          message: err?.data?.message || 'Failed to delete task'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  };

  // Map backend priority/status to UI display format
  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  const formatStatus = (status) => {
    return status === "Complete" ? "Done" : "To Do";
  };

  // Filter tasks based on selected filters and completion status
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    const statusMatch = !filters.status || 
      (filters.status === "Done" && task.status === "Complete") ||
      (filters.status === "To Do" && task.status === "Incomplete");
    
    // Filter by priority  
    const priorityMatch = !filters.priority || 
      task.priority === filters.priority.toLowerCase();
    
    // Hide completed tasks if option is enabled
    const completionMatch = !hideCompleted || task.status !== "Complete";
      
    return statusMatch && priorityMatch && completionMatch;
  });

  // Task date helpers
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

  // Get unique values for filter options
  const uniquePriorities = ["High", "Medium", "Low"];
  const uniqueStatuses = ["To Do", "Done"];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userName || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your tasks and progress
          </p>
        </div>
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 rounded-md shadow-md p-4 flex items-center ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.type === 'success' ? (
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
            <p className="text-red-600">Error loading tasks: {error?.data?.message || 'Something went wrong'}</p>
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
                    {filteredTasks.filter((t) => t.status === "Complete").length}
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
                  {hideCompleted ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
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
                  {(filters.status || filters.priority) && (
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
                      {uniqueStatuses.map((status) => (
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
                      {uniquePriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
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
              filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow duration-200 ${getCardBackground(task)}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`text-lg font-semibold mb-1 ${task.status === "Complete" ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/edit-task/${task._id}`}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        >
                          <FaEdit className="text-sm" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                          disabled={isDeleting}
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px] ${task.status === "Complete" ? "line-through text-gray-400" : ""}`}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(task.status)}`}
                      >
                        {task.status === "Complete" ? <FaCheckCircle className="mr-1" /> : null}
                        {formatStatus(task.status)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
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
                    {task.owner && (
                      <div className="text-xs text-gray-500 flex items-center mt-2">
                        <FaUser className="mr-1" />
                        Owner
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
      </div>
    </div>
  );
};

export default TaskDashboard;
