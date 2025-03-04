import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaFilter,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

const TaskDashboard = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
  });

  // Mock data - replace with actual API calls
  const [tasks] = useState([
    {
      id: 1,
      title: "Implement Authentication",
      description: "Add user authentication and protected routes",
      status: "In Progress",
      priority: "High",
      dueDate: "2024-03-01",
      assignees: ["John Doe"],
    },
    {
      id: 2,
      title: "Create Dashboard UI",
      description: "Design and implement the main dashboard interface",
      status: "To Do",
      priority: "Medium",
      dueDate: "2024-03-05",
      assignees: ["Jane Smith"],
    },
    {
      id: 3,
      title: "API Integration",
      description: "Connect frontend with backend API endpoints",
      status: "Done",
      priority: "High",
      dueDate: "2024-02-28",
      assignees: ["John Doe", "Jane Smith"],
    },
  ]);

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
    switch (status.toLowerCase()) {
      case "done":
        return "text-green-600 bg-green-50 border-green-100";
      case "in progress":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "to do":
        return "text-gray-600 bg-gray-50 border-gray-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

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
      assignee: "",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = !filters.status || task.status === filters.status;
    const priorityMatch =
      !filters.priority || task.priority === filters.priority;
    const assigneeMatch =
      !filters.assignee || task.assignees.includes(filters.assignee);
    return statusMatch && priorityMatch && assigneeMatch;
  });

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(tasks.map((task) => task.status))];
  const uniquePriorities = [...new Set(tasks.map((task) => task.priority))];
  const uniqueAssignees = [...new Set(tasks.flatMap((task) => task.assignees))];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {"User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your team's tasks and progress
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Total: {filteredTasks.length}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  In Progress:{" "}
                  {
                    filteredTasks.filter((t) => t.status === "In Progress")
                      .length
                  }
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Done:{" "}
                  {filteredTasks.filter((t) => t.status === "Done").length}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
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
                {(filters.status || filters.priority || filters.assignee) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <FaTimes className="mr-1" />
                    Clear filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={filters.assignee}
                    onChange={(e) =>
                      handleFilterChange("assignee", e.target.value)
                    }
                    className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Assignees</option>
                    {uniqueAssignees.map((assignee) => (
                      <option key={assignee} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {task.title}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500">
                      <FaCheckCircle className="mr-2 h-4 w-4" />
                      <span className="text-sm">Status</span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500">
                      <FaClock className="mr-2 h-4 w-4" />
                      <span className="text-sm">Due Date</span>
                    </div>
                    <span
                      className={`text-sm ${
                        isOverdue(task.dueDate)
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500">
                      <FaUser className="mr-2 h-4 w-4" />
                      <span className="text-sm">Assignees</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {task.assignees.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                No tasks match the selected filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
