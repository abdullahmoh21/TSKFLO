import React from "react";

/**
 * Reusable text input field with character counter
 */
const TextInputField = ({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder,
  error,
  required = false,
  maxLength,
  type = "text",
  className = "",
  showCharCount = false,
}) => {
  // Calculate color for character count
  const getCharacterCountColor = (current, max) => {
    if (!max) return "text-secondary-500 dark:text-secondary-400";
    
    const percentage = (current / max) * 100;
    if (percentage < 70) return "text-success-600 dark:text-success-400";
    if (percentage < 90) return "text-warning-600 dark:text-warning-400";
    return "text-danger-600 dark:text-danger-400";
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-secondary-900 dark:text-white"
        >
          {label} {required && <span className="text-danger-600">*</span>}
        </label>
        
        {showCharCount && maxLength && (
          <span className={`text-xs ${getCharacterCountColor(value.length, maxLength)}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500" 
            : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
        } bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500`}
      />
      
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInputField; 