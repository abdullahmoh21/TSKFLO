import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers,
  FaTasks,
  FaChartLine,
  FaClock,
  FaLock,
  FaUnlock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilter,
  FaSort,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import CreateTask from "./CreateTask";
import { useSelector } from "react-redux";
import {
  useGetAdminTasksQuery,
  useGetAdminUsersQuery,
  useDeleteAdminTaskMutation,
  useUpdateAdminTaskMutation,
} from "../features/admin/adminApiSlice";

// Add these imports at the top of your file
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [expandedTask, setExpandedTask] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    dueDate: "",
  });

  // Add the isOverdue function
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // RTK Query hooks with debug logs
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useGetAdminTasksQuery(undefined, {
    onError: (error) => {
      console.error('Tasks Query Error:', error);
      setError(error.message || 'Failed to fetch tasks');
    }
  });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useGetAdminUsersQuery(undefined, {
    onError: (error) => {
      console.error('Users Query Error:', error);
      setError(error.message || 'Failed to fetch users');
    }
  });

  // Log data for debugging
  useEffect(() => {
    if (tasks?.length > 0) {
      console.log('Tasks loaded successfully:', tasks);
    }
    if (users?.length > 0) {
      console.log('Users loaded successfully:', users);
    }
  }, [tasks, users]);

  // Calculate metrics only when data is available
  const metrics = useMemo(() => ({
    totalUsers: users?.length || 0,
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(task => task.status === 'completed')?.length || 0,
    upcomingDeadlines: tasks?.filter(task => new Date(task.dueDate) > new Date())?.length || 0,
    weeklyTaskCompletion: [65, 72, 78, 85, 82, 90, 88],
    teamPerformance: {
      labels: ["Team A", "Team B", "Team C", "Team D"],
      data: [85, 72, 90, 78],
    },
  }), [tasks, users]);

  // Add retry functionality with loading state
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    try {
      await Promise.all([refetchTasks(), refetchUsers()]);
    } catch (error) {
      console.error('Retry failed:', error);
      setError('Failed to refresh data');
    } finally {
      setIsRetrying(false);
    }
  };

  const [deleteTask] = useDeleteAdminTaskMutation();
  const [updateTask] = useUpdateAdminTaskMutation();

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task");
      }
    }
  };

  const handleLockTask = async (taskId, isLocked) => {
    try {
      await updateTask({
        taskId,
        isLocked: !isLocked
      }).unwrap();
    } catch (error) {
      console.error("Error updating task lock status:", error);
      setError("Failed to update task lock status");
    }
  };

  // Chart data for weekly task completion
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Tasks Completed",
        data: metrics.weeklyTaskCompletion,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Weekly Task Completion",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Add these variables for filter options
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(tasks.map(task => task.status))];
    return statuses.filter(Boolean); // Remove any undefined/null values
  }, [tasks]);

  const uniquePriorities = useMemo(() => {
    const priorities = [...new Set(tasks.map(task => task.priority))];
    return priorities.filter(Boolean);
  }, [tasks]);

  const uniqueAssignees = useMemo(() => {
    const assignees = [...new Set(tasks.flatMap(task => task.assignees || []))];
    return assignees.filter(Boolean);
  }, [tasks]);

  // Update the sortedAndFilteredTasks to handle potential undefined values
  const sortedAndFilteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filteredTasks = [...tasks];

    // Apply filters
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task?.status === filters.status);
    }
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task?.priority === filters.priority);
    }
    if (filters.assignee) {
      filteredTasks = filteredTasks.filter(task => 
        Array.isArray(task?.assignees) && task.assignees.includes(filters.assignee)
      );
    }
    if (filters.dueDate) {
      const today = new Date();
      switch (filters.dueDate) {
        case 'overdue':
          filteredTasks = filteredTasks.filter(task => task?.dueDate && new Date(task.dueDate) < today);
          break;
        case 'today':
          filteredTasks = filteredTasks.filter(task => {
            if (!task?.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          filteredTasks = filteredTasks.filter(task => {
            if (!task?.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= today && taskDate <= nextWeek;
          });
          break;
        default:
          break;
      }
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        (task?.title || '').toLowerCase().includes(term) ||
        (task?.description || '').toLowerCase().includes(term) ||
        (Array.isArray(task?.assignees) && task.assignees.some(assignee => 
          (assignee || '').toLowerCase().includes(term)
        ))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredTasks.sort((a, b) => {
        const aValue = a?.[sortConfig.key];
        const bValue = b?.[sortConfig.key];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredTasks;
  }, [tasks, filters, sortConfig, searchTerm]);

  // Update the getPriorityColor function to handle undefined values
  const getPriorityColor = (priority) => {
    if (!priority) return "text-gray-600 bg-gray-50 border-gray-100";
    
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

  // Update the getStatusColor function to handle undefined values
  const getStatusColor = (status) => {
    if (!status) return "text-gray-600 bg-gray-50 border-gray-100";
    
    switch (status.toLowerCase()) {
      case "done":
      case "completed":
        return "text-green-600 bg-green-50 border-green-100";
      case "in progress":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "to do":
        return "text-gray-600 bg-gray-50 border-gray-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  // Create User Modal
  const CreateUserModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New User
          </h3>
          <button
            onClick={() => setShowCreateUser(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleCreateUser}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={newUser.phoneNumber}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNumber: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Create User
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
      {(error || tasksError || usersError) && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || tasksError?.message || usersError?.message}</span>
            <div className="mt-2">
              <button
                onClick={handleRetry}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Retry
              </button>
              <button 
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => setError(null)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateUser && <CreateUserModal />}
      {showCreateTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Task
              </h3>
              <button
                onClick={() => setShowCreateTask(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <CreateTask
              isModal={true}
              onClose={() => setShowCreateTask(false)}
            />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users, tasks, and monitor system performance
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUsers className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {metrics.totalUsers}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaTasks className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {metrics.totalTasks}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaChartLine className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Completed Tasks
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  {metrics.completedTasks}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaClock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Upcoming Deadlines
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  {metrics.upcomingDeadlines}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === "users"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === "tasks"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tasks
              </button>
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  User Management
                </h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaPlus className="mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                {isLoadingUsers ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : usersError ? (
                  <div className="text-center py-4 text-red-600">Error loading users: {usersError.message}</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id || user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() =>
                                navigate(`/admin/users/${user.id}/edit`)
                              }
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-indigo-900">
                    Task Management
                  </h2>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-md border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200"
                    >
                      <FaFilter className="mr-2" />
                      Filters
                      <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFilterDropdown && (
                      <div className="absolute mt-2 right-0 w-72 bg-white rounded-lg shadow-lg border border-indigo-100 z-10 p-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={filters.status}
                              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">All Status</option>
                              {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                              value={filters.priority}
                              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">All Priorities</option>
                              {uniquePriorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <select
                              value={filters.dueDate}
                              onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">All Due Dates</option>
                              <option value="overdue">Overdue</option>
                              <option value="today">Due Today</option>
                              <option value="week">Due This Week</option>
                            </select>
                          </div>

                          {Object.values(filters).some(Boolean) && (
                            <button
                              onClick={() => {
                                setFilters({ status: "", priority: "", assignee: "", dueDate: "" });
                                setSearchTerm("");
                              }}
                              className="w-full mt-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow"
                >
                  <FaPlus className="mr-2" />
                  Add Task
                </button>
              </div>

              {/* Task List */}
              <div className="overflow-hidden rounded-lg border border-indigo-100">
                {isLoadingTasks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-8 text-red-600">
                    Error loading tasks: {tasksError.message}
                  </div>
                ) : sortedAndFilteredTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-indigo-100">
                      <thead className="bg-indigo-50/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Title & Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Priority
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Assignees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-indigo-100">
                        {sortedAndFilteredTasks.map((task) => (
                          <tr 
                            key={task._id || task.id}
                            className="group hover:bg-indigo-50/30 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div 
                                className="cursor-pointer transition-all duration-200" 
                                onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-indigo-900 group-hover:text-indigo-700">
                                    {task.title || 'No Title'}
                                  </div>
                                  <FaChevronDown className={`text-indigo-400 transform transition-transform duration-200 ${
                                    expandedTask === task._id ? 'rotate-180' : ''
                                  }`} />
                                </div>
                                <div className={`mt-2 text-sm text-gray-600 transition-all duration-300 ${
                                  expandedTask === task._id 
                                    ? 'max-h-32 opacity-100' 
                                    : 'max-h-0 opacity-0 overflow-hidden'
                                }`}>
                                  {task.description || 'No description available'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-700'}`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700">
                                {Array.isArray(task.assignees) ? task.assignees.join(", ") : 'No Assignees'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => navigate(`/admin/tasks/${task._id}/edit`)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() => handleLockTask(task._id, task.isLocked)}
                                  className="text-indigo-400 hover:text-indigo-600 transition-colors duration-200"
                                >
                                  {task.isLocked ? <FaUnlock /> : <FaLock />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tasks match the selected filters.</p>
                    <button
                      onClick={() => {
                        setFilters({ status: "", priority: "", assignee: "", dueDate: "" });
                        setSearchTerm("");
                      }}
                      className="mt-2 text-indigo-600 hover:text-indigo-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Task Completion Rate
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (metrics.completedTasks / metrics.totalTasks) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {Math.round(
                          (metrics.completedTasks / metrics.totalTasks) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Team Performance
                    </h3>
                    <div className="h-40">
                      {metrics.teamPerformance.labels.map((team, index) => (
                        <div key={team} className="flex items-center mb-2">
                          <span className="w-16 text-sm text-gray-600">
                            {team}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${metrics.teamPerformance.data[index]}%`,
                              }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {metrics.teamPerformance.data[index]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Task Completion Chart */}
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">
                    Weekly Progress
                  </h3>
                  <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    {/* Mock recent activity items */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUsers className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-900">
                          New user John Doe joined the team
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <FaTasks className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-900">
                          Task "Update Documentation" completed
                        </p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
