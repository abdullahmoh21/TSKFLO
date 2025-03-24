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
  FaChartLine,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaArrowUp,
  FaStar,
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
  selectCurrentToken,
} from "../features/auth/authSlice";
import { setUserData } from "../features/auth/authSlice";
import EditTaskModal from "../components/EditTaskModal";
import { 
  formatPriority, 
  formatStatus, 
  isOverdue, 
  isApproachingDueDate, 
  getPriorityColor, 
  getStatusColor, 
  formatDate, 
  getCardBackground 
} from "../utils/taskUtils";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    taskRelation: "",
  });

  // Get username and userId from Redux state
  const userName = useSelector(selectCurrentUserName);
  const userId = useSelector(selectCurrentUserId);
  const token = useSelector(selectCurrentToken);

  // state for managing completed tasks visibility
  const [hideCompleted, setHideCompleted] = useState(false);

  // New notification state
  const [notification, setNotification] = useState(null);

  // State for task detail modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Animation state
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);

  // State for edit task modal
  const [editTaskData, setEditTaskData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Trigger user profile fetch
  const { data: userData, isLoading: isLoadingProfile } = useGetMyDataQuery(
    undefined,
    { skip: !token }
  );

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

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
        setNotification({
          type: "success",
          message: "Task deleted successfully",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        setNotification({
          type: "error",
          message: err?.data?.message || "Error deleting task",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Handle click on a task to view details
  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTimeout(() => {
      setSelectedTask(null);
    }, 200); // small delay to allow exit animation
  };

  // Function to open edit modal instead of navigating
  const openEditTaskModal = (task) => {
    setEditTaskData(task);
    setShowEditModal(true);
  };

  // Function to close edit modal
  const closeEditTaskModal = () => {
    setShowEditModal(false);
    setEditTaskData(null);
  };

  // Handle successful task update
  const handleTaskUpdated = () => {
    closeEditTaskModal();
    refetch(); // Refresh the tasks list
  };

  // Helper functions
  const getTaskRelationshipLabel = (task) => {
    const isOwner = task.owner && task.owner._id === userId;
    const isAssignee =
      task.assignees && task.assignees.some((a) => a._id === userId);

    if (isOwner && isAssignee) {
      return "You're both the creator and assignee";
    } else if (isOwner) {
      return "You created this task";
    } else if (isAssignee) {
      return "Assigned to you";
    } else {
      return "Observer"; // fallback, should not happen in most cases
    }
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

  // Count tasks by priority for stats
  const highPriorityCount = filteredTasks.filter(
    (t) => t.priority === "high"
  ).length;
  const mediumPriorityCount = filteredTasks.filter(
    (t) => t.priority === "medium"
  ).length;
  const lowPriorityCount = filteredTasks.filter(
    (t) => t.priority === "low"
  ).length;

  // Count tasks by status for stats
  const todoCount = filteredTasks.filter(
    (t) => t.status === "Incomplete"
  ).length;
  const doneCount = filteredTasks.filter((t) => t.status === "Complete").length;

  // Calculate completion rate
  const completionRate =
    filteredTasks.length > 0
      ? Math.round((doneCount / filteredTasks.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 pt-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Overview Stats */}
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 transform transition-all duration-700 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Welcome Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back{userName ? `, ${userName}!` : "!"}
            </h1>
            <p className="text-primary-100 mb-4">
              You have {todoCount} tasks to complete and {doneCount} completed
              tasks
            </p>
            <Link
              to="/create-task"
              className="inline-flex items-center px-4 py-2 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-all shadow-sm hover-lift"
            >
              <FaPlus className="mr-2" /> Create New Task
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="glass-morphism rounded-xl p-4 shadow-md flex flex-col justify-between transform transition-all duration-700 delay-100">
            <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Completion Rate
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-secondary-900 dark:text-white">
                {completionRate}%
              </div>
              <FaChartLine className="text-primary-500 text-xl" />
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 mt-3">
              <div
                className="bg-primary-500 h-2.5 rounded-full"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-morphism rounded-xl p-4 shadow-md flex flex-col justify-between transform transition-all duration-700 delay-200">
            <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Priority Breakdown
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center">
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  High
                </div>
                <div className="text-xl font-medium text-danger-600 dark:text-danger-400">
                  {highPriorityCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  Medium
                </div>
                <div className="text-xl font-medium text-warning-600 dark:text-warning-400">
                  {mediumPriorityCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  Low
                </div>
                <div className="text-xl font-medium text-success-600 dark:text-success-400">
                  {lowPriorityCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 rounded-lg shadow-lg p-4 flex items-center animate-slide-in-right ${
              notification.type === "success"
                ? "bg-success-50 text-success-800 dark:bg-success-900/80 dark:text-success-200"
                : "bg-danger-50 text-danger-800 dark:bg-danger-900/80 dark:text-danger-200"
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
          <div className="glass-morphism rounded-xl shadow-md p-8 mb-6 text-center transform transition-all duration-500 animate-pulse">
            <FaSpinner className="animate-spin text-primary-500 dark:text-primary-400 text-3xl mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-300">
              Loading your tasks...
            </p>
          </div>
        )}

        {isError && (
          <div className="glass-morphism rounded-xl shadow-md p-8 mb-6 text-center">
            <div className="text-danger-500 dark:text-danger-400 mb-4">
              <FaTimes className="text-3xl mx-auto" />
            </div>
            <p className="text-danger-600 dark:text-danger-300 mb-4">
              Error loading tasks:{" "}
              {error?.data?.message || "Something went wrong"}
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Actions Bar */}
        {!isLoading && !isError && (
          <div
            className={`glass-morphism rounded-xl shadow-md p-4 mb-6 transform transition-all duration-700 delay-300 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
                  <FaClipboardList className="mr-2 text-primary-500 dark:text-primary-400" />
                  Tasks
                </h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    Total: {filteredTasks.length}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300">
                    To Do: {todoCount}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300">
                    Done: {doneCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setHideCompleted(!hideCompleted)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800"
                >
                  {hideCompleted ? (
                    <FaEye className="text-primary-500" />
                  ) : (
                    <FaEyeSlash className="text-secondary-500" />
                  )}
                  <span>
                    {hideCompleted ? "Show Completed" : "Hide Completed"}
                  </span>
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800"
                >
                  <FaFilter
                    className={
                      showFilters ? "text-primary-500" : "text-secondary-500"
                    }
                  />
                  <span>Filter</span>
                  {showFilters ? (
                    <FaChevronUp className="ml-1" />
                  ) : (
                    <FaChevronDown className="ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Section */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Priorities</option>
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task Relationship Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Relationship
                    </label>
                    <select
                      value={filters.taskRelation}
                      onChange={(e) =>
                        handleFilterChange("taskRelation", e.target.value)
                      }
                      className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Tasks</option>
                      <option value="created">Created by me</option>
                      <option value="assigned">Assigned to me</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Grid/List */}
        {!isLoading && !isError && (
          <div
            className={`mb-8 transform transition-all duration-700 delay-500 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {sortedTasks.length === 0 ? (
              <div className="glass-morphism rounded-xl shadow-md p-8 text-center">
                <FaClipboardList className="text-4xl mx-auto mb-4 text-secondary-400 dark:text-secondary-600" />
                <h3 className="text-xl font-medium text-secondary-900 dark:text-white mb-2">
                  No tasks found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                  {filters.status || filters.priority || filters.taskRelation
                    ? "Try adjusting your filters"
                    : "You don't have any tasks yet"}
                </p>
                <Link
                  to="/create-task"
                  className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <FaPlus className="mr-2" /> Create New Task
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedTasks.map((task, index) => (
                  <div
                    key={task._id}
                    className={`${getCardBackground(
                      task
                    )} rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 ${
                      hoveredTask === task._id
                        ? "ring-2 ring-primary-500 dark:ring-primary-400"
                        : ""
                    } transform transition-all duration-700 delay-${
                      (index % 9) * 100
                    }`}
                    onMouseEnter={() => setHoveredTask(task._id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    <div className="p-5">
                      <div className="flex flex-col mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2 w-[60%]">
                            <div className="flex flex-shrink-0 mt-1">
                              {task.priority === "high" && (
                                <span className="text-danger-500 dark:text-danger-400 mr-1">
                                  <FaArrowUp />
                                </span>
                              )}
                              {isOverdue(task.dueDate) && (
                                <span className="text-danger-500 dark:text-danger-400">
                                  <FaExclamationCircle />
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white truncate">
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {formatStatus(task.status)}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-white/50 dark:bg-secondary-700/50 ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {formatPriority(task.priority)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {getTaskRelationshipLabel(task)}
                        </div>
                      </div>

                      <p className="text-secondary-700 dark:text-secondary-300 mb-4 line-clamp-2">
                        {task.description || "No description provided"}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
                          <FaCalendarAlt className="text-primary-500 dark:text-primary-400" />
                          <span
                            className={
                              isOverdue(task.dueDate)
                                ? "text-danger-600 dark:text-danger-400"
                                : isApproachingDueDate(task.dueDate)
                                ? "text-warning-600 dark:text-warning-400"
                                : ""
                            }
                          >
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openTaskDetail(task)}
                            className="p-1.5 rounded-full text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700/50 transition-colors"
                            aria-label="View task details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="p-1.5 rounded-full text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700/50 transition-colors"
                            aria-label="Edit task"
                          >
                            <FaEdit />
                          </button>
                          {task.owner && task.owner._id === userId && (
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="p-1.5 rounded-full text-secondary-500 hover:text-danger-500 dark:text-secondary-400 dark:hover:text-danger-400 hover:bg-secondary-100 dark:hover:bg-secondary-700/50 transition-colors"
                              aria-label="Delete task"
                              disabled={isDeleting}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Task Detail Modal */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {selectedTask.title}
                  </h2>
                  <button
                    onClick={closeTaskModal}
                    className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Description
                      </h3>
                      <p className="text-secondary-800 dark:text-secondary-200">
                        {selectedTask.description || "No description provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Due Date
                      </h3>
                      <p className="text-secondary-800 dark:text-secondary-200 flex items-center gap-2">
                        <FaCalendarAlt
                          className={
                            isOverdue(selectedTask.dueDate)
                              ? "text-danger-500"
                              : isApproachingDueDate(selectedTask.dueDate)
                              ? "text-warning-500"
                              : "text-primary-500"
                          }
                        />
                        {selectedTask.dueDate
                          ? formatDate(selectedTask.dueDate)
                          : "No due date"}
                        {isOverdue(selectedTask.dueDate) && (
                          <span className="text-danger-500 dark:text-danger-400 text-sm bg-danger-50 dark:bg-danger-900/30 px-2 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                        {isApproachingDueDate(selectedTask.dueDate) && (
                          <span className="text-warning-500 dark:text-warning-400 text-sm bg-warning-50 dark:bg-warning-900/30 px-2 py-0.5 rounded-full">
                            Due soon
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Status
                      </h3>
                      <p
                        className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                          selectedTask.status
                        )}`}
                      >
                        {formatStatus(selectedTask.status)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Priority
                      </h3>
                      <p
                        className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium bg-white dark:bg-secondary-700 ${getPriorityColor(
                          selectedTask.priority
                        )}`}
                      >
                        {formatPriority(selectedTask.priority)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Created By
                      </h3>
                      <p className="text-secondary-800 dark:text-secondary-200 flex items-center gap-1.5">
                        <FaUser className="text-primary-500" />
                        {selectedTask.owner
                          ? selectedTask.owner.name
                          : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
                        Assigned To
                      </h3>
                      {selectedTask.assignees &&
                      selectedTask.assignees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.assignees.map((assignee) => (
                            <span
                              key={assignee._id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
                            >
                              <FaUser className="text-xs" /> {assignee.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-secondary-800 dark:text-secondary-200">
                          No assignees
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      closeTaskModal();
                      openEditTaskModal(selectedTask);
                    }}
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" /> Edit Task
                  </button>
                  <button
                    onClick={closeTaskModal}
                    className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EditTaskModal */}
        {editTaskData && (
          <EditTaskModal
            task={editTaskData}
            isOpen={showEditModal}
            onClose={closeEditTaskModal}
            onSuccess={handleTaskUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
