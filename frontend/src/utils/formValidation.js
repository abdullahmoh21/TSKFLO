export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Validates task form data and returns any validation errors
 * @param {Object} formData - The task form data to validate
 * @param {string} formData.title - Task title
 * @param {string} formData.description - Task description
 * @param {string} formData.dueDate - Task due date
 * @param {Array} [formData.assignees] - Optional task assignees array
 * @returns {Object} An object containing validation errors (empty if no errors)
 */
export const validateTaskForm = (formData) => {
  const errors = {};
  
  // Validate title
  if (!formData.title || !formData.title.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }
  
  // Validate description
  if (formData.description && formData.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }
  
  // Validate due date
  if (!formData.dueDate) {
    errors.dueDate = "Due date is required";
  }
  
  return errors;
};

/**
 * Gets color class for character count display based on percentage of max length
 * @param {number} current - Current character count 
 * @param {number} max - Maximum allowed characters
 * @returns {string} Tailwind CSS class for text color
 */
export const getCharacterCountColor = (current, max) => {
  const percentage = (current / max) * 100;
  if (percentage < 70) return "text-success-600 dark:text-success-400";
  if (percentage < 90) return "text-warning-600 dark:text-warning-400";
  return "text-danger-600 dark:text-danger-400";
};