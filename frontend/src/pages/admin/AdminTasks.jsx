import React, { useState, useMemo, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaExclamationCircle,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUnlock,
  FaLock,
  FaSpinner,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// Import your custom components - AdminCreateTask removed
import {
  useGetAdminTasksQuery,
  useDeleteAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useLockAdminTaskMutation,
} from "../../features/admin/adminApiSlice";

// Import task utilities
import {
  isOverdue,
  getPriorityColor,
  getStatusColor,
} from "../../utils/taskUtils";

// Pagination: tasks/page
const TASKS_PER_PAGE = 8;

// -- EditTaskForm Component
const EditTaskForm = ({ task, onClose }) => {
  const [updateTask, { isLoading }] = useUpdateAdminTaskMutation();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // We'll store field values in local state:
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState(task.priority || "medium");
  const [status, setStatus] = useState(task.status || "Incomplete");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const updatedTaskData = {
      taskId: task._id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
    };
    if (dueDate) updatedTaskData.dueDate = dueDate;

    try {
      await updateTask(updatedTaskData).unwrap();
      setSuccess(true);
      // close modal after a short delay
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Task update error:", err);
      setError(err.data?.message || "Failed to update task");
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 rounded-lg flex items-center">
          <FaExclamationCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-300 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2 flex-shrink-0" />
          <span>Task updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Title <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter task title"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            placeholder="Enter task description"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="relative flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
              value={priority.toLowerCase()}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="relative flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Incomplete">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckCircle className="mr-1" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminTasks = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  // local UI states - removed showCreateTask state
  const [expandedTask, setExpandedTask] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    dueDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredTask, setHoveredTask] = useState(null);

  // For editing a task
  const [editTaskData, setEditTaskData] = useState(null);

  // For deleting tasks
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // For locking tasks
  const [lockTaskId, setLockTaskId] = useState(null);
  const [lockSuccess, setLockSuccess] = useState(false);
  const [lockError, setLockError] = useState(null);

  // Queries
  const {
    data: tasksData = {
      tasks: [],
      pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 },
    },
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetAdminTasksQuery({ page: currentPage, limit: TASKS_PER_PAGE });

  const [deleteTask, { isLoading: isDeleting }] = useDeleteAdminTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateAdminTaskMutation();
  const [lockTask, { isLoading: isLocking }] = useLockAdminTaskMutation();

  // Extract tasks & pagination
  const tasks = tasksData.tasks || [];
  const pagination = tasksData.pagination || {
    totalTasks: 0,
    currentPage: 1,
    totalPages: 1,
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter + search + sort
  const sortedAndFilteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    let filteredTasks = [...tasks];

    // Apply filters
    if (filters.status) {
      filteredTasks = filteredTasks.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(
        (t) => t.priority === filters.priority
      );
    }
    if (filters.assignee) {
      filteredTasks = filteredTasks.filter(
        (t) =>
          Array.isArray(t.assignees) && t.assignees.includes(filters.assignee)
      );
    }
    if (filters.dueDate) {
      const today = new Date();
      switch (filters.dueDate) {
        case "overdue":
          filteredTasks = filteredTasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < today
          );
          break;
        case "today":
          filteredTasks = filteredTasks.filter((t) => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          filteredTasks = filteredTasks.filter((t) => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate >= today && taskDate <= nextWeek;
          });
          break;
        default:
          break;
      }
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(term) ||
          (t.description || "").toLowerCase().includes(term) ||
          (Array.isArray(t.assignees) &&
            t.assignees.some((assignee) =>
              (assignee || "").toLowerCase().includes(term)
            ))
      );
    }

    // Sort
    if (sortConfig.key) {
      filteredTasks.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredTasks;
  }, [tasks, filters, sortConfig, searchTerm]);

  // unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    const st = [...new Set(tasks.map((t) => t.status))];
    return st.filter(Boolean);
  }, [tasks]);

  const uniquePriorities = useMemo(() => {
    const pr = [...new Set(tasks.map((t) => t.priority))];
    return pr.filter(Boolean);
  }, [tasks]);

  const uniqueAssignees = useMemo(() => {
    const asgn = [...new Set(tasks.flatMap((t) => t.assignees || []))];
    return asgn.filter(Boolean);
  }, [tasks]);

  // Deleting tasks
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setDeleteTaskId(taskId);
    setDeleteError(null);
    try {
      await deleteTask(taskId).unwrap();
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        setDeleteTaskId(null);
      }, 2000);

      // handle pagination shift if only 1 item on the page
      if (tasks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        refetchTasks();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setDeleteError(err.data?.message || "Failed to delete task");
      setTimeout(() => {
        setDeleteError(null);
        setDeleteTaskId(null);
      }, 3000);
    }
  };

  // Lock/unlock tasks
  const handleLockTask = async (taskId, locked) => {
    setLockTaskId(taskId);
    setLockError(null);
    setLockSuccess(false);

    try {
      await lockTask({ taskId, locked }).unwrap();
      setLockSuccess(true);
      setTimeout(() => {
        setLockSuccess(false);
        setLockTaskId(null);
      }, 1500);
      refetchTasks();
    } catch (err) {
      console.error("Error updating task lock status:", err);
      if (err.data && err.data.message) {
        console.error("Backend error message:", err.data.message);
      }
      setLockError(err.data?.message || "Failed to update lock status");
      setTimeout(() => {
        setLockError(null);
        setLockTaskId(null);
      }, 3000);
    }
  };

  // Pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // handle editing
  const handleEditTask = (task) => {
    setEditTaskData(task);
  };

  // handle "Create Task" button - updated to navigate to admin createTask page with redirectTo
  const handleCreateTask = () => {
    navigate("/admin/createTask?redirectTo=/admin/tasks");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <div className="glass-morphism rounded-xl shadow-sm p-6 mb-6 mt-6 border border-secondary-200 dark:border-secondary-700">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Task Management
          </span>
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage and monitor all tasks in the system
        </p>
      </div>

      {/* Errors */}
      {isErrorTasks && (
        <div
          className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 px-4 py-3 rounded-lg shadow-sm mb-4"
          role="alert"
        >
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="ml-2">
              {tasksError.message || "Failed to fetch tasks"}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-secondary-800 dark:to-secondary-900 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              Task Management
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Manage and monitor all tasks in the system
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-secondary-400 dark:text-secondary-500" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200"
              >
                <FaFilter className="mr-2" />
                Filters
                {showFilterDropdown ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="absolute mt-2 right-0 w-72 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      >
                        <option value="">All Status</option>
                        {uniqueStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) =>
                          setFilters({ ...filters, priority: e.target.value })
                        }
                        className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      >
                        <option value="">All Priorities</option>
                        {uniquePriorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Due Date
                      </label>
                      <select
                        value={filters.dueDate}
                        onChange={(e) =>
                          setFilters({ ...filters, dueDate: e.target.value })
                        }
                        className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      >
                        <option value="">All Due Dates</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Due Today</option>
                        <option value="week">Due This Week</option>
                      </select>
                    </div>

                    {Object.values(filters).some(Boolean) && (
                      <button
                        onClick={() =>
                          setFilters({
                            status: "",
                            priority: "",
                            assignee: "",
                            dueDate: "",
                          })
                        }
                        className="w-full mt-2 px-4 py-2 text-sm text-danger-600 bg-danger-50 dark:bg-danger-900/20 hover:bg-danger-100 dark:hover:bg-danger-800/30 rounded-lg"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Create Task Button - Updated to only have one button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateTask}
                className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                <FaPlus className="mr-2" /> Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
          {isLoadingTasks ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-secondary-600 dark:text-secondary-400">
                Loading tasks...
              </p>
            </div>
          ) : sortedAndFilteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                <thead className="bg-secondary-50 dark:bg-secondary-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Title &amp; Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Lock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Assignees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                  {sortedAndFilteredTasks.map((task) => (
                    <tr
                      key={task._id}
                      className={`group hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors duration-200 ${
                        deleteTaskId === task._id
                          ? "bg-danger-50 dark:bg-danger-900/20"
                          : lockTaskId === task._id && lockSuccess
                          ? "bg-success-50 dark:bg-success-900/20"
                          : ""
                      }`}
                    >
                      {/* Title & description */}
                      <td className="px-6 py-4">
                        <div
                          className="cursor-pointer transition-all duration-200"
                          onClick={() =>
                            setExpandedTask(
                              expandedTask === task._id ? null : task._id
                            )
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {task.title || "No Title"}
                            </div>
                            {expandedTask === task._id ? (
                              <FaChevronUp className="text-secondary-400 dark:text-secondary-500" />
                            ) : (
                              <FaChevronDown className="text-secondary-400 dark:text-secondary-500" />
                            )}
                          </div>
                          <div
                            className={`mt-2 text-sm text-secondary-600 dark:text-secondary-400 transition-all duration-300 ${
                              expandedTask === task._id
                                ? "max-h-32 opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"
                            }`}
                          >
                            {task.description || "No description available"}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            isOverdue(task.dueDate)
                              ? "text-danger-600 dark:text-danger-400"
                              : "text-secondary-700 dark:text-secondary-300"
                          }`}
                        >
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No Due Date"}
                        </span>
                      </td>

                      {/* Lock Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {task.locked ? (
                            <div className="flex items-center text-danger-600 dark:text-danger-400">
                              <FaLock className="mr-2" />
                              <span className="text-sm">Locked</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-success-600 dark:text-success-400">
                              <FaUnlock className="mr-2" />
                              <span className="text-sm">Unlocked</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assignees */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(task.assignees) &&
                          task.assignees.length > 0 ? (
                            task.assignees.map((assignee) => (
                              <span
                                key={assignee._id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300"
                              >
                                {assignee.name}
                              </span>
                            ))
                          ) : (
                            <span>No Assignees</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task._id);
                            }}
                            className="text-danger-500 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
                            disabled={isDeleting && deleteTaskId === task._id}
                          >
                            {isDeleting && deleteTaskId === task._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLockTask(task._id, task.locked);
                            }}
                            className="text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400"
                            disabled={isLocking && lockTaskId === task._id}
                          >
                            {isLocking && lockTaskId === task._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : task.locked ? (
                              <FaLock />
                            ) : (
                              <FaUnlock />
                            )}
                          </button>
                        </div>

                        {deleteSuccess && deleteTaskId === task._id && (
                          <div className="mt-2 text-xs text-success-600 dark:text-success-400 flex items-center">
                            <FaCheckCircle className="mr-1" /> Deleted
                          </div>
                        )}
                        {deleteError && deleteTaskId === task._id && (
                          <div className="mt-2 text-xs text-danger-600 dark:text-danger-400">
                            Error: {deleteError}
                          </div>
                        )}
                        {lockSuccess && lockTaskId === task._id && (
                          <div className="mt-2 text-xs text-success-600 dark:text-success-400 flex items-center">
                            <FaCheckCircle className="mr-1" />
                            Task {task.locked ? "unlocked" : "locked"}{" "}
                            successfully
                          </div>
                        )}
                        {lockError && lockTaskId === task._id && (
                          <div className="mt-2 text-xs text-danger-600 dark:text-danger-400">
                            Error: {lockError}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium ${
                      currentPage === 1
                        ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                        : "text-primary-700 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium ${
                      currentPage === pagination.totalPages
                        ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                        : "text-primary-700 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-secondary-700 dark:text-secondary-400">
                      Showing{" "}
                      <span className="font-medium">
                        {tasks.length
                          ? (currentPage - 1) * TASKS_PER_PAGE + 1
                          : 0}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * TASKS_PER_PAGE,
                          pagination.totalTasks
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.totalTasks}
                      </span>{" "}
                      tasks
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                          currentPage === 1
                            ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                            : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                        }`}
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      {[...Array(pagination.totalPages).keys()].map((page) => (
                        <button
                          key={page + 1}
                          onClick={() => handlePageChange(page + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                            currentPage === page + 1
                              ? "z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400"
                              : "bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700 text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === pagination.totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                          currentPage === pagination.totalPages
                            ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                            : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                        }`}
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-500 dark:text-secondary-400">
                No tasks match the selected filters.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    status: "",
                    priority: "",
                    assignee: "",
                    dueDate: "",
                  })
                }
                className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editTaskData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border max-w-2xl shadow-xl rounded-xl bg-white dark:bg-secondary-800 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  Edit Task
                </span>
              </h3>
              <button
                onClick={() => setEditTaskData(null)}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <EditTaskForm
              task={editTaskData}
              onClose={() => {
                setEditTaskData(null);
                refetchTasks();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
