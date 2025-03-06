import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaCalendarAlt, FaExclamationCircle, FaCheck, FaUsers } from "react-icons/fa";
import { useCreateTaskMutation } from "../features/tasks/taskApiSlice";
import { useGetUsersQuery } from "../features/tasks/taskApiSlice";

// Maximum description length as defined by the backend
const MAX_DESCRIPTION_LENGTH = 500;

const CreateTask = () => {
    const [task, setTask] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "Incomplete", // Keep for UI, but won't send to API
        assignees: [] // New field for assignees
    });
    
    const [createTask, { isLoading, isError, error }] = useCreateTaskMutation();
    const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If description field, check length limit
        if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
            return; // Don't update if exceeding max length
        }
        
        setTask({ ...task, [name]: value });
    };

    // Handle selecting assignees (can be multiple)
    const handleAssigneeChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setTask({ ...task, assignees: selectedValues });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (task.description.length > MAX_DESCRIPTION_LENGTH) {
            setErrorMessage(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`);
            return;
        }
        
        try {
            // Format task data for API - only include fields the API expects
            // Explicitly omit 'status' as the backend doesn't allow it during creation
            const payload = {
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.priority.toLowerCase(),
                assignees: task.assignees // Include assignees
            };
            
            console.log('Submitting task:', payload);
            await createTask(payload).unwrap();
            
            // Show success notification
            setNotification({
                type: 'success',
                message: 'Task created successfully!'
            });
            
            // Navigate after a brief delay to show the notification
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Failed to create task:', err);
            setErrorMessage(err?.data?.message || 'Failed to create task. Please try again.');
        }
    };

    // Calculate remaining characters
    const remainingChars = MAX_DESCRIPTION_LENGTH - task.description.length;
    const isNearLimit = remainingChars <= 50;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaTasks className="text-blue-500" />
                    Create New Task
                </h2>

                {/* Success Notification */}
                {notification && (
                    <div className="fixed top-20 right-4 z-50 rounded-md shadow-md p-4 flex items-center bg-green-100 text-green-800">
                        <FaCheck className="mr-2" />
                        <span>{notification.message}</span>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                        {errorMessage}
                    </div>
                )}

                {/* Task Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Task Title */}
                    <div className="flex flex-col">
                        <label htmlFor="title" className="text-gray-700 font-medium">
                            Task Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter task title"
                            value={task.title}
                            onChange={handleChange}
                            className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                        <label htmlFor="description" className="text-gray-700 font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter task description"
                            value={task.description}
                            onChange={handleChange}
                            className={`border rounded-lg p-3 w-full focus:ring-2 focus:outline-none ${
                                isNearLimit ? "focus:ring-yellow-500 border-yellow-300" : "focus:ring-blue-500"
                            }`}
                            required
                            rows="4"
                        />
                        <div className={`text-right text-sm mt-1 ${
                            isNearLimit ? "text-yellow-600" : "text-gray-500"
                        }`}>
                            {remainingChars} characters remaining
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="relative flex flex-col">
                        <label htmlFor="dueDate" className="text-gray-700 font-medium">
                            Due Date
                        </label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={task.dueDate}
                                onChange={handleChange}
                                className="border rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Assignees - New Field */}
                    <div className="relative flex flex-col">
                        <label htmlFor="assignees" className="text-gray-700 font-medium">
                            Assign To
                        </label>
                        <div className="relative">
                            <FaUsers className="absolute left-3 top-3 text-gray-400" />
                            <select
                                id="assignees"
                                name="assignees"
                                multiple
                                value={task.assignees}
                                onChange={handleAssigneeChange}
                                className="border rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                            >
                                {isLoadingUsers ? (
                                    <option disabled>Loading users...</option>
                                ) : (
                                    usersData?.users?.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Hold Ctrl/Cmd to select multiple users
                            </p>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="relative flex flex-col">
                        <label htmlFor="priority" className="text-gray-700 font-medium">
                            Priority
                        </label>
                        <div className="relative">
                            <FaExclamationCircle className="absolute left-3 top-3 text-gray-400" />
                            <select
                                name="priority"
                                value={task.priority}
                                onChange={handleChange}
                                className="border rounded-lg p-3 pl-10 w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Status (Keep UI, but won't be sent in API) */}
                    <div className="flex flex-col">
                        <label htmlFor="status" className="text-gray-700 font-medium">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={task.status}
                            onChange={handleChange}
                            className="border rounded-lg p-3 w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                            disabled
                        >
                            <option value="Incomplete">To Do</option>
                            <option value="Complete">Done</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Note: New tasks are automatically set to "To Do" status
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
                    >
                        {isLoading ? "Creating..." : "Create Task"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
