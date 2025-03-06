import { useState, useEffect } from "react";
import { FaTasks, FaCalendarAlt, FaUser, FaExclamationCircle, FaCheckCircle, FaSearch, FaTimes } from "react-icons/fa";
import { useCreateAdminTaskMutation } from "../features/admin/adminApiSlice";

const CreateTask = ({ isModal = false, onClose }) => {
    const [createTask, { isLoading }] = useCreateAdminTaskMutation();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [task, setTask] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "To Do",
        assignees: [],
    });

    // Fetch users when search term changes
    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchTerm) {
                setUsers([]);
                return;
            }
            
            setIsLoadingUsers(true);
            try {
                const response = await fetch(`http://localhost:3200/user/all?search=${searchTerm}`);
                const data = await response.json();
                setUsers(data.users || []);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to fetch users');
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const debounceTimer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "assignedUser") {
            // Convert comma-separated string to array and trim whitespace
            const assignees = value ? value.split(",").map(id => id.trim()).filter(Boolean) : [];
            setTask(prev => ({ ...prev, assignees }));
        } else {
            setTask(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUserSelect = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
            setTask(prev => ({
                ...prev,
                assignees: [...prev.assignees, user._id]
            }));
        }
        setSearchTerm("");
        setShowUserDropdown(false);
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
        setTask(prev => ({
            ...prev,
            assignees: prev.assignees.filter(id => id !== userId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        
        // Validate form fields
        const validationErrors = [];
        if (!task.title.trim()) {
            validationErrors.push("Title is required");
        }
        if (!task.description.trim()) {
            validationErrors.push("Description is required");
        }
        if (!task.dueDate) {
            validationErrors.push("Due date is required");
        }
        
        if (validationErrors.length > 0) {
            setError(`Please fix the following: ${validationErrors.join(", ")}`);
            return;
        }
        
        try {
            // Format data for the API
            const { status, ...taskWithoutStatus } = task;
            
            // Create a clean task object with expected fields
            const taskData = {
                title: task.title.trim(),
                description: task.description.trim(),
                dueDate: new Date(task.dueDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
                priority: task.priority.toLowerCase(),
            };
            
            // Only include assignees if it's not empty
            if (task.assignees && task.assignees.length > 0) {
                taskData.assignees = task.assignees;
            }
            
            console.log("Sending task data to API:", taskData);
            const result = await createTask(taskData).unwrap();
            console.log("Task created successfully:", result);
            
            // Show success message
            setSuccess(true);
            
            // Reset form and close modal if in modal mode
            setTimeout(() => {
                setTask({
                    title: "",
                    description: "",
                    dueDate: "",
                    priority: "medium",
                    status: "To Do",
                    assignees: [],
                });
                
                if (isModal && onClose) {
                    onClose();
                }
            }, 1500); // Give the user a moment to see the success message
            
        } catch (err) {
            console.error("Task creation error:", err);
            console.error("Error details:", {
                status: err.status,
                data: err.data,
                message: err.message
            });
            
            // Special handling for PARSING_ERROR that might occur when the task is actually created
            if (err.status === 'PARSING_ERROR' && onClose) {
                setSuccess(true);
                setTimeout(() => {
                    setTask({
                        title: "",
                        description: "",
                        dueDate: "",
                        priority: "medium",
                        status: "To Do",
                        assignees: [],
                    });
                    onClose();
                }, 1500);
                return;
            }
            
            // More user-friendly error message
            let errorMessage = "Failed to create task";
            
            if (err.status === 404) {
                errorMessage = "Server endpoint not found. Please contact the administrator.";
            } else if (err.status === 400) {
                // For 400 errors, try to extract the specific validation error
                if (err.data) {
                    if (typeof err.data === 'string') {
                        errorMessage = err.data;
                    } else if (err.data.message) {
                        errorMessage = err.data.message;
                    } else if (err.data.error) {
                        errorMessage = err.data.error;
                    } else {
                        // Try to construct message from validation errors
                        const errorDetails = [];
                        for (const field in err.data) {
                            if (err.data[field]) {
                                errorDetails.push(`${field}: ${err.data[field]}`);
                            }
                        }
                        if (errorDetails.length > 0) {
                            errorMessage = `Validation errors: ${errorDetails.join(', ')}`;
                        } else {
                            errorMessage = "Invalid data. Please check your inputs.";
                        }
                    }
                }
            } else if (err.status === 401 || err.status === 403) {
                errorMessage = "You don't have permission to create tasks.";
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div className={`${!isModal ? "flex justify-center items-center min-h-screen bg-gray-100 p-4" : ""}`}>
            <div className={`bg-white ${!isModal ? "shadow-lg rounded-lg p-8 max-w-lg w-full" : "w-full"}`}>
                {!isModal && (
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaTasks className="text-indigo-500" />
                        Create New Task
                    </h2>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
                        <FaCheckCircle className="mr-2" />
                        Task created successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                            className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    </div>

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
                            className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    </div>

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
                                className="border rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

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
                                className="border rounded-lg p-3 pl-10 w-full bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative flex flex-col">
                        <label className="text-gray-700 font-medium mb-2">
                            Assign Users
                        </label>
                        <div className="relative">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedUsers.map(user => (
                                    <div 
                                        key={user._id}
                                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2"
                                    >
                                        <span>{user.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user._id)}
                                            className="text-indigo-500 hover:text-indigo-700"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowUserDropdown(true);
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    className="border rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            {showUserDropdown && (searchTerm || users.length > 0) && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {isLoadingUsers ? (
                                        <div className="p-3 text-center text-gray-500">
                                            Loading users...
                                        </div>
                                    ) : users.length > 0 ? (
                                        users.map(user => (
                                            <div
                                                key={user._id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <FaUser className="text-gray-400" />
                                                <span>{user.name}</span>
                                            </div>
                                        ))
                                    ) : searchTerm ? (
                                        <div className="p-3 text-center text-gray-500">
                                            No users found
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold p-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition duration-300 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoading ? "Creating Task..." : "Create Task"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
