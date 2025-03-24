import { useState, useEffect } from "react";
import { FaUser, FaSearch, FaTimes, FaSpinner } from "react-icons/fa";

/**
 * Assignee selector component for selecting users to assign a task to
 */
const AssigneeSelector = ({ 
  assignees = [],
  onAssigneeAdd,
  onAssigneeRemove,
  searchResults = [],
  isSearching = false,
  onSearchQueryChange
}) => {
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchQueryChange(assigneeQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [assigneeQuery, onSearchQueryChange]);

  const handleAssigneeChange = (e) => {
    setAssigneeQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowAssigneeDropdown(true);
    } else {
      setShowAssigneeDropdown(false);
    }
  };

  const handleUserSelect = (user) => {
    if (!assignees.find((a) => a._id === user._id)) {
      onAssigneeAdd(user);
    }
    
    setAssigneeQuery("");
    setShowAssigneeDropdown(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-secondary-900 dark:text-white">
        Assign To
      </label>
      
      {/* Selected assignees display */}
      {assignees.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {assignees.map((user) => (
            <div 
              key={user._id} 
              className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm"
            >
              <FaUser className="text-xs" />
              <span>{user.name || user.email}</span>
              <button 
                type="button"
                onClick={() => onAssigneeRemove(user._id)}
                className="ml-1 text-primary-400 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Assignee search */}
      <div className="relative">
        <div className="flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-secondary-400 dark:text-secondary-500" />
          </div>
          <input
            type="text"
            value={assigneeQuery}
            onChange={handleAssigneeChange}
            placeholder="Search for users to assign..."
            className="pl-10 w-full px-4 py-3 rounded-lg border border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
          />
        </div>
        
        {/* Dropdown for search results */}
        {showAssigneeDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary-800 shadow-lg rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            {isSearching ? (
              <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
                <FaSpinner className="animate-spin mx-auto mb-2" />
                <p>Searching...</p>
              </div>
            ) : assigneeQuery.length < 2 ? (
              <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
                Type at least 2 characters to search
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
                No users found
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <li key={user._id}>
                    <button
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors flex items-center"
                    >
                      <FaUser className="mr-2 text-secondary-500 dark:text-secondary-400" />
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssigneeSelector; 