// filepath: /Users/abdullahmunir/Desktop/task-management/frontend/src/components/TaskDetailsModal.jsx
import React from "react";
import { FaCalendarAlt, FaUser, FaEdit } from "react-icons/fa";
import Modal from "./Modal";

const TaskDetailsModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onEditClick,
  formatDate,
  isOverdue,
  isApproachingDueDate,
  getStatusColor,
  getPriorityColor,
  formatStatus,
  formatPriority
}) => {
  if (!task) return null;
  
  // Footer buttons for the Modal
  const modalFooter = (
    <>
      <button
        onClick={() => {
          onClose();
          onEditClick(task);
        }}
        className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        <FaEdit className="mr-2" /> Edit Task
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium transition-all"
      >
        Close
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      footer={modalFooter}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Description
            </h3>
            <p className="text-secondary-800 dark:text-secondary-200">
              {task.description || "No description provided"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Due Date
            </h3>
            <p className="text-secondary-800 dark:text-secondary-200 flex items-center gap-2">
              <FaCalendarAlt
                className={
                  isOverdue(task.dueDate)
                    ? "text-danger-500"
                    : isApproachingDueDate(task.dueDate)
                    ? "text-warning-500"
                    : "text-primary-500"
                }
              />
              {task.dueDate
                ? formatDate(task.dueDate)
                : "No due date"}
              {isOverdue(task.dueDate) && (
                <span className="text-danger-500 dark:text-danger-400 text-sm bg-danger-50 dark:bg-danger-900/30 px-2 py-0.5 rounded-full">
                  Overdue
                </span>
              )}
              {isApproachingDueDate(task.dueDate) && (
                <span className="text-warning-500 dark:text-warning-400 text-sm bg-warning-50 dark:bg-warning-900/30 px-2 py-0.5 rounded-full">
                  Due soon
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Status
            </h3>
            <p
              className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {formatStatus(task.status)}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Priority
            </h3>
            <p
              className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium bg-white dark:bg-secondary-700 ${getPriorityColor(
                task.priority
              )}`}
            >
              {formatPriority(task.priority)}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Created By
            </h3>
            <p className="text-secondary-800 dark:text-secondary-200 flex items-center gap-1.5">
              <FaUser className="text-primary-500" />
              {task.owner
                ? task.owner.name
                : "Unknown"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 mb-1">
              Assigned To
            </h3>
            {task.assignees &&
            task.assignees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((assignee) => (
                  <span
                    key={assignee._id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
                  >
                    <FaUser className="text-xs" /> {assignee.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-secondary-800 dark:text-secondary-200">
                No assignees
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;