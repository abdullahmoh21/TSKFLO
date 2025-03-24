import React from "react";

/**
 * Reusable select field component
 */
const SelectField = ({
  id,
  name,
  label,
  value = "",
  onChange,
  options = [],
  error,
  required = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-secondary-900 dark:text-white mb-2"
      >
        {label} {required && <span className="text-danger-600">*</span>}
      </label>
      
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? "border-danger-300 dark:border-danger-700 focus:ring-danger-500 focus:border-danger-500" 
            : "border-secondary-300 dark:border-secondary-700 focus:ring-primary-500 focus:border-primary-500"
        } bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white`}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField; 