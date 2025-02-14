import React, { useState } from 'react';
import backgroundImage from '../assets/background.png';
import Navbar from '../layout/NavBar';

const TaskManagement = () => {
  const [completedTasks, setCompletedTasks] = useState({});

  const handleComplete = (taskId) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center animate-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navbar />
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden p-8 mt-20">
        <h2 className="text-3xl font-bold mb-6">Task Management</h2>
        <p className="text-gray-700 mb-4">
          Welcome to your task management page. Manage and track your tasks here.
        </p>
        <div className="space-y-4">
          {["Task 1: Complete User Profile", "Task 2: Fix navigation issue", "Task 3: Add task management"].map((task, index) => (
            <div
              key={index}
              className={`flex items-center justify-between border-b pb-2 transition duration-300 ${completedTasks[index] ? 'bg-green-200' : ''}`}
            >
              <span className="text-lg text-gray-800">{task}</span>
              <button
                onClick={() => handleComplete(index)}
                className={`px-4 py-2 rounded-md transition duration-300 ${completedTasks[index] ? 'bg-gray-400 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {completedTasks[index] ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
