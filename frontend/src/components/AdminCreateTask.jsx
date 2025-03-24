import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  useCreateAdminTaskMutation,
  useSearchUsersQuery,
} from "../features/admin/adminApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../features/auth/authSlice";
import { toast } from "react-toastify";

// Import our new components
import TaskFormHeader from "./task/TaskFormHeader";
import AssigneeSelector from "./task/AssigneeSelector";
import TextInputField from "./common/TextInputField";
import TextareaField from "./common/TextareaField";
import SelectField from "./common/SelectField";

// Maximum length constants
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const AdminCreateTask = ({ isModal = false, onClose }) => {
  const navigate = useNavigate();
  const userId = useSelector(selectCurrentUserId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignees: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // API hooks
  const [createTaskMutation] = useCreateAdminTaskMutation();
  const {
    data: searchResults = { users: [] },
    isLoading: isSearching,
  } = useSearchUsersQuery(
    debouncedQuery,
    { skip: !debouncedQuery || debouncedQuery.length < 2 }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUserSelect = (user) => {
    setFormData((prev) => ({
      ...prev,
      assignees: [...prev.assignees, user],
    }));
  };

  const handleUserRemove = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((user) => user._id !== userId),
    }));
  };

  const handleSearchQueryChange = (query) => {
    setDebouncedQuery(query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.dueDate) errors.dueDate = "Due date is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      // Prepare data - make sure it matches what the backend expects
      const payload = {
        title: formData.title,
        description: formData.description || "",
        dueDate: formData.dueDate,
        priority: formData.priority,
        assignees: formData.assignees.map(user => user._id) // Get just the IDs
      };
      
      console.log("Submitting task:", payload);
      
      // Make the API call
      const result = await createTaskMutation(payload).unwrap();
      console.log("Task creation result:", result);
      
      // Show success alert
      toast.success(result.message || "Task created successfully!");
      
      // Simple success behavior - just redirect
      if (isModal && onClose) {
        onClose();
      } else {
        // Use navigate to maintain session state
        try {
          navigate("/admindashboard");
        } catch (error) {
          console.error("Navigation error:", error);
          // Only as a fallback, and use href instead of replace to be gentler
          window.location.href = "/admindashboard";
        }
      }
    } catch (err) {
      console.error("Task creation error:", err);
      // Show a more informative error message
      let errorMessage;
      
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.error) {
        errorMessage = typeof err.error === 'string' ? err.error : 'An unexpected error occurred';
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = "Failed to create task. Please try again.";
      }
      
      toast.error(errorMessage);
      
      // Update form errors for display
      setFormErrors({
        ...formErrors,
        general: errorMessage
      });
    }
  };

  // Priority options for select field
  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <div className="bg-white dark:bg-secondary-900 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Form header with title and tips */}
        <TaskFormHeader
          isModal={isModal}
          onBack={isModal ? onClose : undefined}
        />
        
        {/* Main form */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error display for top-level errors */}
            {formErrors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200 p-4 rounded-lg">
                {formErrors.general}
              </div>
            )}
            
            {/* Title field */}
            <TextInputField
              id="title"
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a concise task title"
              error={formErrors.title}
              required={true}
              maxLength={MAX_TITLE_LENGTH}
              showCharCount={true}
            />
            
            {/* Description field */}
            <TextareaField
              id="description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task in detail..."
              error={formErrors.description}
              required={true}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={6}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date field */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-secondary-900 dark:text-white mb-2">
                  Due Date <span className="text-danger-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                      formErrors.dueDate
                        ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500"
                        : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
                    } bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white`}
                  />
                  {formErrors.dueDate && (
                    <div className="flex items-center mt-1 text-sm text-danger-600 dark:text-danger-400">
                      <FaExclamationCircle className="mr-1" />
                      {formErrors.dueDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority field */}
              <SelectField
                id="priority"
                name="priority"
                label="Priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
              />
            </div>
            
            {/* Assignee selector */}
            <AssigneeSelector
              assignees={formData.assignees}
              onAssigneeAdd={handleUserSelect}
              onAssigneeRemove={handleUserRemove}
              searchResults={searchResults.users || []}
              isSearching={isSearching}
              onSearchQueryChange={handleSearchQueryChange}
            />
            
            {/* Form actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={isModal ? onClose : () => navigate("/admindashboard")}
                className="px-6 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg font-medium text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-900"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateTask; 