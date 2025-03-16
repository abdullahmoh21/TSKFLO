import React, { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaExclamationCircle, FaSpinner, FaSave } from "react-icons/fa";
import { useUpdateTaskMutation } from "../features/tasks/taskApiSlice";

// Maximum description length as defined by the backend
const MAX_DESCRIPTION_LENGTH = 500;

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "Incomplete"
  });
  
  // Update task mutation
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Update form when task changes
  useEffect(() => {
    if (task) {
      // Format date to YYYY-MM-DD for the date input
      const formattedDate = task.dueDate 
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : '';
      
      setTaskData({
        title: task.title || "",
        description: task.description || "",
        dueDate: formattedDate,
        priority: task.priority || "medium",
        status: task.status || "Incomplete"
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If description field, check length limit
    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      return; // Don't update if exceeding max length
    }
    
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (taskData.description.length > MAX_DESCRIPTION_LENGTH) {
      setErrorMessage(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`);
      return;
    }
    
    try {
      // Format task data for API
      const payload = {
        taskId: task._id,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority.toLowerCase(),
        status: taskData.status
      };
      
      await updateTask(payload).unwrap();
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Task updated successfully!'
      });
      
      // Notify parent component and close after a brief delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to update task:', err);
      setErrorMessage(err?.data?.message || 'Failed to update task. Please try again.');
    }
  };
  
  if (!isOpen || !task) return null;
  
  const descriptionCharsLeft = MAX_DESCRIPTION_LENGTH - taskData.description.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Edit Task
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Error Notification */}
          {errorMessage && (
            <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 p-3 rounded-lg text-sm mb-4 animate-pulse">
              <FaExclamationCircle className="inline mr-2" />
              {errorMessage}
            </div>
          )}
          
          {/* Success Notification */}
          {notification && notification.type === 'success' && (
            <div className="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 p-3 rounded-lg text-sm mb-4 animate-pulse">
              {notification.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Task Title <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Enter task title..."
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={taskData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                placeholder="Enter task description..."
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${
                  descriptionCharsLeft < 50 ? 'text-danger-500' : 'text-secondary-500 dark:text-secondary-400'
                }`}>
                  {descriptionCharsLeft} characters remaining
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
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
                    value={taskData.dueDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={taskData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="Incomplete">To Do</option>
                  <option value="Complete">Done</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal; 