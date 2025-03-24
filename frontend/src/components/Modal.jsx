// filepath: /Users/abdullahmunir/Desktop/task-management/frontend/src/components/Modal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Reusable Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content (typically buttons)
 * @param {string} props.maxWidth - Maximum width of modal (e.g., 'max-w-2xl')
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {React.ReactNode} props.notification - Notification content to display
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-2xl",
  showCloseButton = true,
  notification = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className={`bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-scale-in`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
              {typeof title === 'string' ? (
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  {title}
                </span>
              ) : (
                title
              )}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          {/* Notification Area */}
          {notification}
          
          {/* Content */}
          <div className="modal-content">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;