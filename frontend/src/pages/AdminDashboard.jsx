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
  FaCalendarAlt,
  FaExclamationCircle,
  FaSpinner,
  FaSave,
  FaArrowUp,
  FaStar,
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
  useCreateAdminTaskMutation,
  useLockAdminTaskMutation,
} from "../features/admin/adminApiSlice";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';

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
  const [editTaskData, setEditTaskData] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    dueDate: "",
  });
  
  // Animation state
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);

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
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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

  const [deleteTask, { isLoading: isDeleting }] = useDeleteAdminTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateAdminTaskMutation();
  const [lockTask, { isLoading: isLocking }] = useLockAdminTaskMutation();
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [lockTaskId, setLockTaskId] = useState(null);
  const [lockSuccess, setLockSuccess] = useState(false);
  const [lockError, setLockError] = useState(null);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setDeleteTaskId(taskId);
      setDeleteError(null);
      try {
        await deleteTask(taskId).unwrap();
        setDeleteSuccess(true);
        
        // Show success message briefly
        setTimeout(() => {
          setDeleteSuccess(false);
          setDeleteTaskId(null);
        }, 2000);
        
        // Refetch tasks to update the list
        refetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        setDeleteError(error.data?.message || "Failed to delete task");
        
        // Clear error after a delay
        setTimeout(() => {
          setDeleteError(null);
          setDeleteTaskId(null);
        }, 3000);
      }
    }
  };

  const handleLockTask = async (taskId, locked) => {
    setLockTaskId(taskId);
    setLockError(null);
    setLockSuccess(false);
    
    try {
      // Call the lockTask mutation - it automatically chooses lock or unlock based on current state
      await lockTask({
        taskId,
        locked: locked
      }).unwrap();
      
      // Show success message briefly
      setLockSuccess(true);
      setTimeout(() => {
        setLockSuccess(false);
        setLockTaskId(null);
      }, 1500);
      
      // Refetch tasks to update the list
      refetchTasks();
    } catch (error) {
      console.error("Error updating task lock status:", error);
      
      // Log more details about the error for debugging
      if (error.data && error.data.message) {
        console.error("Backend error message:", error.data.message);
      }
      
      setLockError(error.data?.message || "Failed to update lock status");
      
      // Clear error after a delay
      setTimeout(() => {
        setLockError(null);
        setLockTaskId(null);
      }, 3000);
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
        borderColor: "rgb(99, 102, 241)",
        tension: 0.1,
        backgroundColor: "rgba(99, 102, 241, 0.5)",
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
    if (!priority) return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
    
    switch (priority.toLowerCase()) {
      case "high":
        return "text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 border-danger-100 dark:border-danger-800";
      case "medium":
        return "text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 border-warning-100 dark:border-warning-800";
      case "low":
        return "text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-100 dark:border-success-800";
      default:
        return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
    }
  };

  // Update the getStatusColor function to handle undefined values
  const getStatusColor = (status) => {
    if (!status) return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
    
    switch (status.toLowerCase()) {
      case "done":
      case "completed":
        return "text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-100 dark:border-success-800";
      case "in progress":
        return "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800";
      case "to do":
      case "incomplete":
        return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
      default:
        return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
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

  // Function to handle opening the edit task modal
  const handleEditTask = (task) => {
    // Format the date to YYYY-MM-DD for the input field
    const formattedTask = {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    };
    setEditTaskData(formattedTask);
  };

  return (
    <div className={`min-h-screen bg-secondary-50 dark:bg-secondary-900 pt-16 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {(error || tasksError || usersError) && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 px-4 py-3 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <strong className="font-bold">Error!</strong>
              <span className="ml-2"> {error || tasksError?.message || usersError?.message}</span>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleRetry}
                className="bg-danger-100 dark:bg-danger-800 hover:bg-danger-200 dark:hover:bg-danger-700 text-danger-700 dark:text-danger-300 font-medium py-1 px-3 rounded-md text-sm transition-colors duration-200 flex items-center"
              >
                {isRetrying ? <FaSpinner className="animate-spin mr-1" /> : null}
                Retry
              </button>
              <button 
                className="text-danger-500 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border max-w-2xl shadow-xl rounded-xl bg-white dark:bg-secondary-800 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  Create New Task
                </span>
              </h3>
              <button
                onClick={() => setShowCreateTask(false)}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <CreateTask
              isModal={true}
              onClose={() => {
                setShowCreateTask(false);
                setTimeout(() => {
                  refetchTasks();
                  console.log("Refreshing tasks after creation");
                }, 500);
              }}
            />
          </div>
        </div>
      )}
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
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="glass-morphism rounded-xl shadow-sm p-6 mb-6 mt-6 border border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 hover:shadow-md">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Manage users, tasks, and monitor system performance
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Users</p>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {metrics.totalUsers}
                </h3>
              </div>
            </div>
          </div>
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/20 text-success-500 dark:text-success-400">
                <FaTasks className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Tasks</p>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {metrics.totalTasks}
                </h3>
              </div>
            </div>
          </div>
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20 text-warning-500 dark:text-warning-400">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Completed Tasks
                </p>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {metrics.completedTasks}
                </h3>
              </div>
            </div>
          </div>
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-danger-100 dark:bg-danger-900/20 text-danger-500 dark:text-danger-400">
                <FaClock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Upcoming Deadlines
                </p>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {metrics.upcomingDeadlines}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-morphism rounded-xl shadow-sm mb-6 border border-secondary-200 dark:border-secondary-700 overflow-hidden">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400"
                  : "text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "users"
                  ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400"
                  : "text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "tasks"
                  ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400"
                  : "text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              }`}
            >
              Tasks
            </button>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                    User Management
                  </span>
                </h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <FaPlus className="mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-secondary-200 dark:border-secondary-700">
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading users...</p>
                  </div>
                ) : usersError ? (
                  <div className="text-center py-8 text-danger-600 dark:text-danger-400">
                    <FaExclamationCircle className="mx-auto h-12 w-12 mb-4" />
                    Error loading users: {usersError.message}
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                    <thead className="bg-secondary-50 dark:bg-secondary-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-700">
                      {users.map((user) => (
                        <tr key={user._id || user.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                                <FaUser />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-secondary-900 dark:text-white">
                                  {user.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3 opacity-70 hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                                aria-label="Edit user"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300 transition-colors duration-200"
                                aria-label="Delete user"
                              >
                                <FaTrash />
                              </button>
                            </div>
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
            <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-secondary-800 dark:to-secondary-900 rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                      Task Management
                    </span>
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

                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200"
                    >
                      <FaFilter className="mr-2" />
                      Filters
                      <FaChevronDown className={`ml-2 transform transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFilterDropdown && (
                      <div className="absolute mt-2 right-0 w-72 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-10 p-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Status</label>
                            <select
                              value={filters.status}
                              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">All Status</option>
                              {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Priority</label>
                            <select
                              value={filters.priority}
                              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                              className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">All Priorities</option>
                              {uniquePriorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Due Date</label>
                            <select
                              value={filters.dueDate}
                              onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                              className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
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
                              }}
                              className="w-full mt-2 px-4 py-2 text-sm text-danger-600 hover:text-danger-700 bg-danger-50 dark:bg-danger-900/20 hover:bg-danger-100 dark:hover:bg-danger-800/30 rounded-lg transition-colors duration-200"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    <FaPlus className="mr-2" />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
                {isLoadingTasks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading tasks...</p>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-8 text-danger-600 dark:text-danger-400">
                    <FaExclamationCircle className="mx-auto h-12 w-12 mb-4" />
                    Error loading tasks: {tasksError.message}
                  </div>
                ) : sortedAndFilteredTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                      <thead className="bg-secondary-50 dark:bg-secondary-700/30">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Title & Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Priority
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Lock Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Assignees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                        {sortedAndFilteredTasks.map((task) => (
                          <tr 
                            key={task._id || task.id}
                            className={`group hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors duration-200 ${
                              deleteTaskId === task._id ? 'bg-danger-50 dark:bg-danger-900/20' : 
                              lockTaskId === task._id && lockSuccess ? 'bg-success-50 dark:bg-success-900/20' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div 
                                className="cursor-pointer transition-all duration-200" 
                                onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                    {task.title || 'No Title'}
                                  </div>
                                  <FaChevronDown className={`text-secondary-400 dark:text-secondary-500 transform transition-transform duration-200 ${
                                    expandedTask === task._id ? 'rotate-180' : ''
                                  }`} />
                                </div>
                                <div className={`mt-2 text-sm text-secondary-600 dark:text-secondary-400 transition-all duration-300 ${
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
                              <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-danger-600 dark:text-danger-400' : 'text-secondary-700 dark:text-secondary-300'}`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                              </span>
                            </td>
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
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(task.assignees) ? 
                                  task.assignees.map(assignee => (
                                    <span 
                                      key={assignee._id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300"
                                    >
                                      {assignee.name}
                                    </span>
                                  )) : 
                                  'No Assignees'
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the row expand
                                    handleEditTask(task);
                                  }}
                                  className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the row expand
                                    handleDeleteTask(task._id);
                                  }}
                                  className="text-danger-500 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 transition-colors duration-200"
                                  disabled={isDeleting && deleteTaskId === task._id}
                                >
                                  {isDeleting && deleteTaskId === task._id ? 
                                    <FaSpinner className="animate-spin" /> : 
                                    <FaTrash />
                                  }
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the row expand
                                      handleLockTask(task._id, task.locked);
                                    }}
                                    className="text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-200"
                                    disabled={isLocking && lockTaskId === task._id}
                                    data-tooltip-id="lock-tooltip"
                                    data-tooltip-content={task.locked ? "Unlock task" : "Lock task"}
                                  >
                                    {isLocking && lockTaskId === task._id ? (
                                      <FaSpinner className="animate-spin" />
                                    ) : task.locked ? (
                                      <div className="relative">
                                        <FaLock />
                                        <div className="absolute -top-2 -right-2 w-2 h-2 bg-danger-500 rounded-full"></div>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <FaUnlock />
                                        <div className="absolute -top-2 -right-2 w-2 h-2 bg-success-500 rounded-full"></div>
                                      </div>
                                    )}
                                  </button>
                                </div>
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
                                  <FaCheckCircle className="mr-1" /> Task {task.locked ? 'unlocked' : 'locked'} successfully
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
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-secondary-500 dark:text-secondary-400">No tasks match the selected filters.</p>
                    <button
                      onClick={() => {
                        setFilters({ status: "", priority: "", assignee: "", dueDate: "" });
                        setSearchTerm("");
                      }}
                      className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
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
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center mb-4">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                    Performance Metrics
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-2">
                      Task Completion Rate
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                        <div
                          className="bg-success-500 dark:bg-success-400 h-2 rounded-full"
                          style={{
                            width: `${
                              (metrics.completedTasks / metrics.totalTasks) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-4 text-sm font-medium text-secondary-900 dark:text-white">
                        {Math.round(
                          (metrics.completedTasks / metrics.totalTasks) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-2">
                      Team Performance
                    </h3>
                    <div className="h-40">
                      {metrics.teamPerformance.labels.map((team, index) => (
                        <div key={team} className="flex items-center mb-2">
                          <span className="w-16 text-sm text-secondary-600 dark:text-secondary-400">
                            {team}
                          </span>
                          <div className="flex-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 ml-2">
                            <div
                              className="bg-primary-500 dark:bg-primary-400 h-2 rounded-full"
                              style={{
                                width: `${metrics.teamPerformance.data[index]}%`,
                              }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                            {metrics.teamPerformance.data[index]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Task Completion Chart */}
                <div className="mt-6 glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                  <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-4">
                    Weekly Progress
                  </h3>
                  <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center mb-4">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                    Recent Activity
                  </span>
                </h2>
                <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                  <div className="space-y-4">
                    {/* Mock recent activity items */}
                    <div className="flex items-start p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <FaUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          New user John Doe joined the team
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                          <FaTasks className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          Task "Update Documentation" completed
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
                          <FaCalendarAlt className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          Task "Quarterly Review" deadline approaching
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Health */}
              <div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center mb-4">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                    System Health
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        Server Status
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300">
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center mt-4">
                      <FaCheckCircle className="h-5 w-5 text-success-500 dark:text-success-400" />
                      <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                        All systems operational
                      </span>
                    </div>
                  </div>
                  <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        Database Load
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-300">
                        Moderate
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">Current: 42%</span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">Threshold: 80%</span>
                      </div>
                      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                        <div className="bg-warning-500 dark:bg-warning-400 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="glass-morphism rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        API Requests
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                        Normal
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">Today: 1,248</span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">Avg: 1,100</span>
                      </div>
                      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                        <div className="bg-primary-500 dark:bg-primary-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReactTooltip 
        id="lock-tooltip"
        place="top"
        variant="dark"
      />
    </div>
  );
};

// Edit Task Form Component
const EditTaskForm = ({ task, onClose }) => {
  const [updateTask, { isLoading }] = useUpdateAdminTaskMutation();
  const [editedTask, setEditedTask] = useState({
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority?.toLowerCase() || 'medium',
    assignees: task.assignees || [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "assignees") {
      // Convert comma-separated string to array and trim whitespace
      const assignees = value ? value.split(",").map(id => id.trim()).filter(Boolean) : [];
      setEditedTask(prev => ({ ...prev, assignees }));
    } else {
      setEditedTask(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form fields
    const validationErrors = [];
    if (!editedTask.title.trim()) {
      validationErrors.push("Title is required");
    }
    
    if (validationErrors.length > 0) {
      setError(`Please fix the following: ${validationErrors.join(", ")}`);
      return;
    }
    
    try {
      // Create a clean task object with expected fields
      const taskData = {
        taskId: task._id,
        title: editedTask.title.trim(),
        description: editedTask.description.trim(),
        priority: editedTask.priority,
      };
      
      // Only include dueDate if it's not empty
      if (editedTask.dueDate) {
        taskData.dueDate = editedTask.dueDate;
      }
      
      // Only include assignees if it's not empty
      if (editedTask.assignees && editedTask.assignees.length > 0) {
        taskData.assignees = editedTask.assignees;
      }
      
      console.log("Updating task:", taskData);
      await updateTask(taskData).unwrap();
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
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
          <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Task Title <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter task title"
            value={editedTask.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter task description"
            value={editedTask.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative flex flex-col">
            <label htmlFor="dueDate" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
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
                value={editedTask.dueDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Priority
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaExclamationCircle className="text-secondary-400 dark:text-secondary-500" />
              </div>
              <select
                name="priority"
                value={editedTask.priority}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaChevronDown className="text-secondary-400 dark:text-secondary-500" />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="assignees" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Assign to (User IDs, comma-separated)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-secondary-400 dark:text-secondary-500" />
              </div>
              <input
                type="text"
                id="assignees"
                name="assignees"
                placeholder="Enter user IDs (comma-separated)"
                value={editedTask.assignees.join(", ")}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex items-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Update Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;
