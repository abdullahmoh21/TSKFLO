const User = require("../models/User");
const Task = require("../models/Task");
const Invitation = require("../models/Invitation");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/emailTransporter");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("../logs/logger");

// ------------------- /admin/users ------------------- //

//@desc returns list of all users with paging
//@param {Object} req with valid Admin JWT
//@route GET /admin/users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  let { page, limit, search } = req.query;

  // Convert page and limit to numbers, and set defaults if not provided
  // Parse values
  page = parseInt(page);
  limit = parseInt(limit);

  // Set defaults for undefined/NaN values, not for 0
  if (isNaN(page)) page = 1;
  if (isNaN(limit)) limit = 10;

  // Ensure page and limit are positive
  if (page < 1 || limit < 1) {
    return res
      .status(400)
      .json({ error: "Page and limit must be positive numbers." });
  }

  const skip = (page - 1) * limit;

  // Build search query if search parameter exists
  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  // Fetch paginated users with search filter if provided
  const users = await User.find(query).skip(skip).limit(limit).lean().exec();

  // Get total number of users matching the search criteria
  const totalUsers = await User.countDocuments(query);

  // Send response with pagination metadata
  res.json({
    totalUsers,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    users,
  });
});

//@desc Invites a new user to register
//@param {Object} req with valid user data
//@route POST /admin/users
//@access Private
const invite = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;

  const [invited, existingUser] = await Promise.all([
    Invitation.findOne({ email }).lean().exec(),
    User.findOne({ email }).lean().exec(),
  ]);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (invited) {
    return res.status(204).json({ message: "User has already been invited" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const newInvitation = new Invitation({
    email,
    name,
    token,
    role,
  });

  const link = `${process.env.URL}/register/${token}`;
  await newInvitation.save();
  try {
    await sendEmail(email, "inviteUser", { name, link });
  } catch (err) {
    // rollback if email sending failed
    await Invitation.deleteOne({ _id: newInvitation._id });
    return res
      .status(500)
      .json({ message: "Error sending email. Please try again later" });
  }

  return res.sendStatus(200);
});

//@desc Update given users data
//@param {Object} req with valid userId
//@route PATCH /admin/users/:userId
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, phone } = req.body;

  const updates = {
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
    ...(phone && { phone }),
  };
  const updatedUser = await User.findOneAndUpdate({ _id: userId }, updates, {
    new: true,
    runValidators: true,
  }).select("_id email phone role name");

  if (!updatedUser) {
    return res.status(404).json({ message: "No user found with this user ID" });
  }

  return res.status(200).json(updatedUser);
});

//@desc deletes given user
//@param {Object} req with valid userId
//@route DELETE /admin/users/:userId
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const deleted = await User.deleteOne({ _id: userId }).exec();
  if (deleted.deletedCount == 0) {
    return res.status(404).json({ message: "No user found with this user ID" });
  }

  res.sendStatus(200);
});

// ------------------- /admin/tasks ------------------- //

//@desc returns list of all tasks with paging
//@param {Object} req with valid Admin JWT
//@route GET /admin/tasks
//@access Private
const getAllTasks = asyncHandler(async (req, res) => {
  let { page, limit } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  // Set defaults for undefined/NaN values, not for 0
  if (isNaN(page)) page = 1;
  if (isNaN(limit)) limit = 10;

  // Ensure page and limit are positive
  if (page < 1 || limit < 1) {
    return res
      .status(400)
      .json({ error: "Page and limit must be positive numbers." });
  }

  const skip = (page - 1) * limit;

  // Fetch paginated users
  const tasks = await Task.find()
    .skip(skip)
    .limit(limit)
    .populate("assignees", "_id name email")
    .lean()
    .exec();

  // Get total number of users
  const totalTasks = await Task.countDocuments();

  // Send response with pagination metadata
  res.json({
    totalTasks,
    currentPage: page,
    totalPages: Math.ceil(totalTasks / limit),
    tasks,
  });
});

//@desc returns list of all tasks with paging
//@param {Object} req with valid Admin JWT
//@route POST /admin/tasks
//@access Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignees } = req.body;

  const task = new Task({
    title,
    description,
    priority,
    dueDate,
    owner: req.user.id,
    assignees,
  });

  await task.save();

  return res.sendStatus(200);
});

//@desc returns a specific task
//@param {Object} req with valid Admin JWT and taskId
//@route GET /admin/tasks/:taskId
//@access Private
const getTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId }).lean().exec();

  if (!task) {
    return res.status(404).json({ message: "No such task exists" });
  }

  return res.status(200).json(task);
});

//@desc updates a specific task
//@param {Object} req with valid Admin JWT and field data
//@route PATCH /admin/tasks/:taskId
//@access Private
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body; //validated with Joi

  const updatedTask = await Task.findOneAndUpdate({ _id: taskId }, updates, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();

  if (!updatedTask) {
    return res.status(404).json({ message: "No such task exists" });
  }

  return res.status(200).json(updatedTask);
});

//@desc deletes a specific task
//@param {Object} req with valid Admin JWT and taskId
//@route DELETE /admin/tasks/:taskId
//@access Private
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const response = await Task.deleteOne({ _id: taskId }).exec();

  if (response.deletedCount == 0) {
    return res.status(404).json({ message: "No Task found" });
  }

  return res.sendStatus(200);
});

//@desc locks a specific task
//@param {Object} req with valid Admin JWT and taskId
//@route PATCH /admin/tasks/:taskId/lock
//@access Private
const lockTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId },
    { locked: true },
    {
      new: true,
      runValidators: true,
    }
  )
    .lean()
    .exec();

  if (!updatedTask) {
    return res.status(404).json({ message: "No such task exists" });
  }

  return res.status(200).json(updatedTask);
});

//@desc unlocks a specific task
//@param {Object} req with valid Admin JWT and taskId
//@route PATCH /admin/tasks/:taskId/unlock
//@access Private
const unlockTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId },
    { locked: false },
    {
      new: true,
      runValidators: true,
    }
  )
    .lean()
    .exec();

  if (!updatedTask) {
    return res.status(404).json({ message: "No such task exists" });
  }

  return res.status(200).json(updatedTask);
});

//@desc returns metrics about the system
//@param {Object} req with valid Admin JWT
//@route GET /admin/metrics
//@access Private
const getMetrics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalAdmins,
    totalTasks,
    completedTasks,
    incompleteTasks,
    lockedTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
  ] = await Promise.all([
    // User metrics:
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),

    // Task metrics:
    Task.countDocuments(),
    Task.countDocuments({ status: "Complete" }),
    Task.countDocuments({ status: "Incomplete" }),
    Task.countDocuments({ locked: true }),
    Task.countDocuments({ priority: "high" }),
    Task.countDocuments({ priority: "medium" }),
    Task.countDocuments({ priority: "low" }),
  ]);

  return res.status(200).json({
    userMetrics: {
      totalUsers,
      totalAdmins,
      totalNonAdmins: totalUsers - totalAdmins,
    },
    taskMetrics: {
      totalTasks,
      completedTasks,
      incompleteTasks,
      lockedTasks,
      tasksByPriority: {
        high: highPriorityTasks,
        medium: mediumPriorityTasks,
        low: lowPriorityTasks,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  invite,
  updateUser,
  deleteUser,
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  lockTask,
  unlockTask,
  getMetrics,
};
