const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");
const logger = require("../logs/logger");

//@desc Returns list of users tasks
//@param {Object} req with valid userId
//@route GET /tasks
//@access Private
const getUserTasks = asyncHandler(async (req, res) => {
  try {
    // Simplified chaining approach
    const user = await User.findOne({ _id: req.user.id }).lean().exec();

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found for provided email" });
    }

    // Simplified chaining approach
    const tasks = await Task.find({
      $or: [{ owner: user._id }, { assignees: user._id }],
    })
      .select("-owner -updatedAt -__v")
      .lean()
      .exec();

    return res.status(200).json(tasks);
  } catch (err) {
    console.error("Error in getUserTasks:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving tasks", error: err.message });
  }
});

//@desc Creates a new Task document
//@param {Object} req with valid userId and task details
//@route POST /tasks
//@access Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignees } = req.body;

  const user = await User.findOne({ _id: req.user.id }).lean().exec();
  if (!user) {
    return res.status(404).json({ message: "No user found in DB" });
  }
  const newTask = new Task({
    title,
    description,
    priority,
    dueDate,
    status: "Incomplete",
    owner: req.user.id,
    assignees,
  });
  await newTask.save();
  return res.status(200).json({ message: "Task created successfully" });
});

//@desc Returns a specific task with all it's details
//@param {Object} req with valid userId and TaskId
//@route GET /tasks/:taskId
//@access Private
const getTask = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;

    // Simplified chaining approach
    const task = await Task.findOne({ _id: taskId }).lean().exec();

    if (!task) {
      return res
        .status(404)
        .json({ message: "No Task with provided ID found" });
    }

    return res.status(200).json(task);
  } catch (err) {
    console.error("Error in getTask:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving task", error: err.message });
  }
});

//@desc Updates a specific task ensuring only allowed fields are edited
//@param {Object} req with valid userId, TaskId, and Task fields
//@route PATCH /tasks/:taskId
//@access Private
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const newData = req.body;
  const allowedUpdates = [
    "status",
    "dueDate",
    "priority",
    "description",
    "title",
  ];

  const task = await Task.findOne({ _id: taskId }).exec();
  if (!task) {
    return res.status(404).json({ message: "No Task with provided ID found" });
  }

  if (task.locked) {
    return res.status(423).json({ message: "The task is locked" });
  }

  // Check for illegal fields
  const keys = Object.keys(newData);
  const disallowed = keys.filter((key) => !allowedUpdates.includes(key));
  if (disallowed.length > 0) {
    return res.status(403).json({
      message: `The field(s) '${disallowed.join(", ")}' cannot be edited`,
    });
  }

  keys.forEach((key) => {
    task[key] = newData[key];
  });

  await task.save();

  return res.status(200).json(task);
});

//@desc Deletes a task ensuring only owners can delete
//@param {Object} req with valid userId and TaskId
//@route DELETE /tasks/:taskId
//@access Private
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndDelete({
    _id: taskId,
    owner: req.user.id,
  }).exec();

  if (!task) {
    return res
      .status(404)
      .json({ message: "User does not own this task or task does not exist" });
  }

  return res.status(200).json({ message: "Task deleted successfully" });
});

//@desc Adds an assignee to a task, ensuring only owner can add
//@param {Object} req with valid userId, TaskId, and assignee ID's
//@route PATCH /tasks/:taskId/assignees
//@access Private
const addAssignee = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const [assignee, task] = await Promise.all([
    User.findById(assigneeId).lean(),
    Task.findOne({
      _id: taskId,
      owner: req.user.id,
    }).exec(),
  ]);

  if (!task) {
    return res
      .status(404)
      .json({ message: "No task found or incorrect permissions" });
  }

  if (!assignee) {
    return res.status(404).json({ message: "No user with provided ID exists" });
  }

  if (task.assignees.includes(assigneeId)) {
    return res.status(204).json({ message: "No changes made" });
  }

  task.assignees.push(assigneeId);
  await task.save();

  //TODO: Send Email alert to assignee
  return res.status(200).json({ message: "Assignee added successfully", task });
});

//@desc Removes an assignee from a task, ensuring only owner can add
//@param {Object} req with valid userId, TaskId, and assignee ID
//@route DELETE /tasks/:taskId/assignees
//@access Private
const removeAssignee = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const task = await Task.findOne({
    _id: taskId,
    owner: req.user.id,
  }).exec();

  if (!task) {
    return res
      .status(404)
      .json({ message: "Task not found or you do not have permission" });
  }

  task.assignees = task.assignees.filter((id) => id.toString() !== assigneeId);
  await task.save();

  return res
    .status(200)
    .json({ message: "Assignee removed successfully", task });
});

module.exports = {
  getUserTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
};
