/**
 * Task utility functions for managing task status, formatting, and display
 */

/**
 * Format priority to display with first letter capitalized
 * @param {string} priority - The task priority (high, medium, low)
 * @returns {string} Formatted priority
 */
export const formatPriority = (priority) => {
  if (!priority) return "Unknown";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

/**
 * Format status for display (Convert Complete/Incomplete to Done/To Do)
 * @param {string} status - The task status (Complete, Incomplete)
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status === "Complete" ? "Done" : "To Do";
};

/**
 * Check if a task is overdue based on due date
 * @param {string|Date} dueDate - The task due date
 * @returns {boolean} True if task is overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now && due.toDateString() !== now.toDateString();
};

/**
 * Check if a task is approaching due date (within 3 days)
 * @param {string|Date} dueDate - The task due date
 * @returns {boolean} True if due date is approaching
 */
export const isApproachingDueDate = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Return true if due date is within 3 days and not overdue
  return diffDays > 0 && diffDays <= 3;
};

/**
 * Get appropriate color classes for priority (Tailwind CSS classes)
 * @param {string} priority - The task priority
 * @returns {string} Tailwind CSS classes for styling
 */
export const getPriorityColor = (priority) => {
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

/**
 * Get appropriate color classes for status (Tailwind CSS classes)
 * @param {string} status - The task status
 * @returns {string} Tailwind CSS classes for styling
 */
export const getStatusColor = (status) => {
  if (!status) return "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 border-secondary-100 dark:border-secondary-800";
  
  switch (status.toLowerCase()) {
    case "done":
    case "complete":
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

/**
 * Format date for display
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get card background style based on task properties
 * @param {Object} task - The task object
 * @returns {string} Tailwind CSS classes for card styling
 */
export const getCardBackground = (task) => {
  if (isOverdue(task.dueDate)) {
    return "border-l-4 border-danger-500 dark:border-danger-600 bg-white dark:bg-secondary-800";
  }
  if (isApproachingDueDate(task.dueDate)) {
    return "border-l-4 border-warning-500 dark:border-warning-600 bg-white dark:bg-secondary-800";
  }
  if (task.status === "Complete") {
    return "border-l-4 border-success-500 dark:border-success-600 bg-white dark:bg-secondary-800";
  }
  return "border-l border-primary-200 dark:border-primary-800 bg-white dark:bg-secondary-800";
}; 