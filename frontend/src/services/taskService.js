import api from './api';

export const TaskService = {
  // Get all tasks
  getTasks: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single task by ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default TaskService; 