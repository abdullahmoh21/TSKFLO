import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  updateTaskStart,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskStart,
  deleteTaskSuccess,
  deleteTaskFailure
} from '../slices/taskSlice';
import api from '../../services/api';

// Fetch all tasks
export const fetchTasks = () => async (dispatch) => {
  try {
    dispatch(fetchTasksStart());
    
    // Since we don't have a backend endpoint for tasks yet, we'll use mock data
    // This would normally be: const response = await api.get('/tasks');
    
    // Mock data - replace with actual API call when the endpoint is ready
    const mockTasks = [
      {
        id: 1,
        title: 'Implement Authentication',
        description: 'Add user authentication and protected routes',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2024-03-01',
        assignees: ['John Doe']
      },
      {
        id: 2,
        title: 'Create Dashboard UI',
        description: 'Design and implement the main dashboard interface',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '2024-03-05',
        assignees: ['Jane Smith']
      },
      {
        id: 3,
        title: 'API Integration',
        description: 'Connect frontend with backend API endpoints',
        status: 'Done',
        priority: 'High',
        dueDate: '2024-02-28',
        assignees: ['John Doe', 'Jane Smith']
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      dispatch(fetchTasksSuccess(mockTasks));
    }, 500);
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
    dispatch(fetchTasksFailure(errorMessage));
  }
};

// Create a new task
export const createTask = (taskData) => async (dispatch) => {
  try {
    dispatch(createTaskStart());
    
    // This would normally be: const response = await api.post('/tasks', taskData);
    
    // Mock response - simulate creating a task with a new ID
    const mockNewTask = {
      ...taskData,
      id: Date.now(), // Generate a unique ID using timestamp
    };
    
    // Simulate API delay
    setTimeout(() => {
      dispatch(createTaskSuccess(mockNewTask));
    }, 500);
    
    return { success: true, task: mockNewTask };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create task';
    dispatch(createTaskFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Update an existing task
export const updateTask = (taskId, taskData) => async (dispatch) => {
  try {
    dispatch(updateTaskStart());
    
    // This would normally be: const response = await api.put(`/tasks/${taskId}`, taskData);
    
    // Mock response - simulate updating a task
    const mockUpdatedTask = {
      ...taskData,
      id: taskId
    };
    
    // Simulate API delay
    setTimeout(() => {
      dispatch(updateTaskSuccess(mockUpdatedTask));
    }, 500);
    
    return { success: true, task: mockUpdatedTask };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update task';
    dispatch(updateTaskFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Delete a task
export const deleteTask = (taskId) => async (dispatch) => {
  try {
    dispatch(deleteTaskStart());
    
    // This would normally be: await api.delete(`/tasks/${taskId}`);
    
    // Simulate API delay
    setTimeout(() => {
      dispatch(deleteTaskSuccess(taskId));
    }, 500);
    
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete task';
    dispatch(deleteTaskFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
}; 