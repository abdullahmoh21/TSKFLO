import { useState, useEffect } from "react";
import { useGetMetricsQuery } from "../../features/admin/adminApiSlice";
import {
  FaUsers,
  FaUserShield,
  FaTasks,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaLock,
  FaExclamationTriangle,
  FaTrophy,
  FaSpinner,
} from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminMetrics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: metricsData, isLoading, isError, error } = useGetMetricsQuery();

  // Trigger a small fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract data for easier access
  const userMetrics = metricsData?.userMetrics || {
    totalUsers: 0,
    totalAdmins: 0,
  };
  const thirtyDayMetrics = metricsData?.taskMetrics?.thirtyDays || {
    totalTasks_30d: 0,
    completedTasks_30d: 0,
    incompleteTasks_30d: 0,
    tasksByPriority: { high: 0, medium: 0, low: 0 },
  };
  const allTimeMetrics = metricsData?.taskMetrics?.allTime || {
    lockedTasks: 0,
    overDueTasks: 0,
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    highPriorityTasks: 0,
    mediumPriorityTasks: 0,
    lowPriorityTasks: 0,
  };
  const topUsers = metricsData?.topUsersByCompletedTasks_30d || [];

  // Calculate completion rates
  const thirtyDayCompletionRate =
    thirtyDayMetrics.totalTasks_30d > 0
      ? Math.round(
          (thirtyDayMetrics.completedTasks_30d /
            thirtyDayMetrics.totalTasks_30d) *
            100
        )
      : 0;

  const allTimeCompletionRate =
    allTimeMetrics.totalTasks > 0
      ? Math.round(
          (allTimeMetrics.completedTasks / allTimeMetrics.totalTasks) * 100
        )
      : 0;

  // Configure chart data
  const thirtyDayPriorityData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [
          thirtyDayMetrics.tasksByPriority.high,
          thirtyDayMetrics.tasksByPriority.medium,
          thirtyDayMetrics.tasksByPriority.low,
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const allTimePriorityData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [
          allTimeMetrics.highPriorityTasks,
          allTimeMetrics.mediumPriorityTasks,
          allTimeMetrics.lowPriorityTasks,
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const thirtyDayStatusData = {
    labels: ["Completed", "Incomplete"],
    datasets: [
      {
        data: [
          thirtyDayMetrics.completedTasks_30d,
          thirtyDayMetrics.incompleteTasks_30d,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(107, 114, 128, 0.7)",
        ],
        borderColor: ["rgba(16, 185, 129, 1)", "rgba(107, 114, 128, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const allTimeStatusData = {
    labels: ["Completed", "Incomplete"],
    datasets: [
      {
        data: [allTimeMetrics.completedTasks, allTimeMetrics.incompleteTasks],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(107, 114, 128, 0.7)",
        ],
        borderColor: ["rgba(16, 185, 129, 1)", "rgba(107, 114, 128, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const topPerformersData = {
    labels: topUsers.map((user) => user.userName),
    datasets: [
      {
        label: "Tasks Completed (Last 30 Days)",
        data: topUsers.map((user) => user.tasksCompleted),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgb(107, 114, 128)",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${value} tasks (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Tasks" },
        ticks: { color: "rgb(107, 114, 128)" },
      },
      x: {
        ticks: { color: "rgb(107, 114, 128)" },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-5xl text-primary-500 mb-4" />
          <h2 className="text-xl text-secondary-600 dark:text-secondary-400">
            Loading metrics...
          </h2>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 p-4 rounded-lg">
          <p>
            Error loading metrics:{" "}
            {error?.data?.message || error?.error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto p-6 transition-opacity duration-500 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="glass-morphism rounded-xl shadow-sm p-6 mb-6 mt-6 border border-secondary-200 dark:border-secondary-700 transform hover:shadow-md">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Admin Metrics
          </span>
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Monitor your system's performance at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-md transform transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                {userMetrics.totalUsers}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-md transform transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400">
              <FaUserShield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Total Admins
              </p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                {userMetrics.totalAdmins}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-md transform transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20 text-warning-500 dark:text-warning-400">
              <FaExclamationTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Overdue Tasks
              </p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                {allTimeMetrics.overDueTasks}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-md transform transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-danger-100 dark:bg-danger-900/20 text-danger-500 dark:text-danger-400">
              <FaLock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                Locked Tasks
              </p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                {allTimeMetrics.lockedTasks}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Last 30 Days Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4 border-b border-secondary-200 dark:border-secondary-700 pb-2">
          Last 30 Days Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                <FaTasks className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Total Tasks
                </p>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                  {thirtyDayMetrics.totalTasks_30d}
                </h3>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Completed
                </p>
                <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {thirtyDayMetrics.completedTasks_30d}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Completion Rate
                </p>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {thirtyDayCompletionRate}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Incomplete
                </p>
                <p className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                  {thirtyDayMetrics.incompleteTasks_30d}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-4">
              Tasks by Priority
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  High
                </p>
                <p className="text-lg font-semibold text-danger-600 dark:text-danger-400">
                  {thirtyDayMetrics.tasksByPriority.high}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Medium
                </p>
                <p className="text-lg font-semibold text-warning-600 dark:text-warning-400">
                  {thirtyDayMetrics.tasksByPriority.medium}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Low
                </p>
                <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {thirtyDayMetrics.tasksByPriority.low}
                </p>
              </div>
            </div>
            <div className="h-40 mt-4">
              <Pie data={thirtyDayPriorityData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-4">
              Task Completion Status
            </h3>
            <div className="h-48">
              <Pie data={thirtyDayStatusData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* All Time Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4 border-b border-secondary-200 dark:border-secondary-700 pb-2">
          All Time Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                <FaTasks className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Total Tasks
                </p>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                  {allTimeMetrics.totalTasks}
                </h3>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Completed
                </p>
                <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {allTimeMetrics.completedTasks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Completion Rate
                </p>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {allTimeCompletionRate}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Incomplete
                </p>
                <p className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                  {allTimeMetrics.incompleteTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-4">
              Tasks by Priority
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  High
                </p>
                <p className="text-lg font-semibold text-danger-600 dark:text-danger-400">
                  {allTimeMetrics.highPriorityTasks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Medium
                </p>
                <p className="text-lg font-semibold text-warning-600 dark:text-warning-400">
                  {allTimeMetrics.mediumPriorityTasks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Low
                </p>
                <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {allTimeMetrics.lowPriorityTasks}
                </p>
              </div>
            </div>
            <div className="h-40 mt-4">
              <Pie data={allTimePriorityData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-4">
              Task Completion Status
            </h3>
            <div className="h-48">
              <Pie data={allTimeStatusData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4 border-b border-secondary-200 dark:border-secondary-700 pb-2">
          <FaTrophy className="inline-block mr-2 text-warning-500" /> Top
          Performers (Last 30 Days)
        </h2>

        <div className="glass-morphism rounded-xl shadow-sm p-6 border border-secondary-200 dark:border-secondary-700 overflow-hidden">
          {topUsers.length > 0 ? (
            <>
              <div className="h-64 mb-4">
                <Bar data={topPerformersData} options={barOptions} />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
                      >
                        Tasks Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                    {topUsers.map((user, index) => (
                      <tr
                        key={user.userId}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-secondary-800"
                            : "bg-secondary-50 dark:bg-secondary-750"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900 dark:text-white">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          {user.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300">
                            {user.tasksCompleted} tasks
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-500 dark:text-secondary-400">
              <p>No user performance data available for the last 30 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
