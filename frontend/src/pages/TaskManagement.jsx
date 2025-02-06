import React from 'react';

const TaskManagement = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-r from-blue-500 to-green-500 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden p-8">
        <h2 className="text-3xl font-bold mb-6">Task Management</h2>
        <p className="text-gray-700 mb-4">
          Welcome to your task management page. Manage and track your tasks here.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-lg text-gray-800">Task 1: Complete User Profile</span>
            <button className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600">
              Mark as Complete
            </button>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-lg text-gray-800">Task 2: Fix navigation issue</span>
            <button className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600">
              Mark as Complete
            </button>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-lg text-gray-800">Task 3: Add task management</span>
            <button className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600">
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
