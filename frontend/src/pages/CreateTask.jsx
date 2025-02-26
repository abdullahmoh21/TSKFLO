import { useState } from "react";
import { FaTasks, FaCalendarAlt, FaUser, FaExclamationCircle } from "react-icons/fa";

const CreateTask = () => {
    const [task, setTask] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "To Do",
        assignedUser: "",
    });

    const handleChange = (e) => {
        setTask({ ...task, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Task Created:", task);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaTasks className="text-blue-500" />
                    Create New Task
                </h2>

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
                            className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
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
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Status (Fixed & Styled) */}
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
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>

                    {/* Assigned User */}
                    <div className="relative flex flex-col">
                        <label htmlFor="assignedUser" className="text-gray-700 font-medium">
                            Assign to (User ID)
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                id="assignedUser"
                                name="assignedUser"
                                placeholder="Enter user ID"
                                value={task.assignedUser}
                                onChange={handleChange}
                                className="border rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Create Task
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
