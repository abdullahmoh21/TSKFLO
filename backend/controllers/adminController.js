const User = require("../models/User");
const Task = require("../models/Task");
const Invitation = require("../models/Invitation");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/emailTransporter");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("../logs/logger");
const { now } = require("mongoose");

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
  try {
    const { email, name, role } = req.body;

    // Create queries
    const invitedQuery = Invitation.findOne({ email });
    invitedQuery.lean();

    const existingUserQuery = User.findOne({ email });
    existingUserQuery.lean();

    // Execute queries in parallel
    const [invited, existingUser] = await Promise.all([
      invitedQuery.exec(),
      existingUserQuery.exec(),
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
    logger.info(`User invited with token: ${token}`);
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

    return res.status(200).json({ link });
  } catch (err) {
    console.error("Error in invite:", err);
    return res
      .status(500)
      .json({ message: "Error inviting user", error: err.message });
  }
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

  try {
    // Get all tasks first
    const query = Task.find();
    // Apply pagination
    query.skip(skip);
    query.limit(limit);
    // Apply population
    query.populate("assignees", "_id name email");
    // Get as plain objects
    query.lean();

    // Execute the query
    const tasks = await query.exec();

    // Get total count in a separate query
    const totalTasks = await Task.countDocuments().exec();

    // Send response with pagination metadata
    res.json({
      totalTasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      tasks,
    });
  } catch (err) {
    console.error("Error in getAllTasks:", err);
    res
      .status(500)
      .json({ message: "Error retrieving tasks", error: err.message });
  }
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
  try {
    const { taskId } = req.params;

    const taskQuery = Task.findOne({ _id: taskId });
    taskQuery.lean();
    const task = await taskQuery.exec();

    if (!task) {
      return res.status(404).json({ message: "No such task exists" });
    }

    return res.status(200).json(task);
  } catch (err) {
    console.error("Error in getTask:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving task", error: err.message });
  }
});

//@desc updates a specific task
//@param {Object} req with valid Admin JWT and field data
//@route PATCH /admin/tasks/:taskId
//@access Private
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body; //validated with Joi

  const task = await Task.findOne({ _id: taskId }).exec();

  if (!task) {
    return res.status(404).json({ message: "No such task exists" });
  }
  const keys = Object.keys(updates);
  keys.forEach((key) => {
    task[key] = updates[key];
  });

  if (updates?.status === "Complete") {
    updates.completedBy = req.user.id;
    updates.completedAt = new Date();
  } else if (updates?.status === "Incomplete") {
    updates.completedBy = null;
    updates.completedAt = null;
  }

  await task.save();

  return res.status(200).json(task);
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
  ).lean();

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
  ).lean();

  if (!updatedTask) {
    return res.status(404).json({ message: "No such task exists" });
  }

  return res.status(200).json(updatedTask);
});

//@desc Adds an assignee to a task, ensuring only owner can add
//@param {Object} req with valid userId, TaskId, and assignee ID's
//@route PATCH /admin/tasks/:taskId/assignees
//@access Private
const addAssignee = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const [assignee, task] = await Promise.all([
    User.findById(assigneeId).lean(),
    Task.findOne({ _id: taskId }).exec(),
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
//@route DELETE /admin/tasks/:taskId/assignees
//@access Private
const removeAssignee = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const task = await Task.findOne({ _id: taskId }).exec();

  if (!task) {
    return res
      .status(404)
      .json({ message: "Task not found or you do not have permission" });
  }

  task.assignees = task.assignees.filter((id) => id.toString() !== assigneeId);
  await task.save();
  //TODO: Send Email alert to assignee

  return res
    .status(200)
    .json({ message: "Assignee removed successfully", task });
});

//@desc returns metrics about the system
//@param {Object} req with valid Admin JWT
//@route GET /admin/metrics
//@access Private
const getMetrics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Run metrics for users, tasks, plus the aggregator:
  const [
    totalUsers,
    totalAdmins,
    totalTasks_30d,
    completedTasks_30d,
    incompleteTasks_30d,
    highPriorityTasks_30d,
    mediumPriorityTasks_30d,
    lowPriorityTasks_30d,
    lockedTasks,
    overDueTasks,
    totalTasks,
    completedTasks,
    incompleteTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    topUsersByCompletedTasks_30d,
  ] = await Promise.all([
    // 1) total users
    User.countDocuments(),

    // 2) total admins
    User.countDocuments({ role: "admin" }),

    // 3) tasks in last 30 days
    Task.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Task.countDocuments({
      status: "Complete",
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Task.countDocuments({
      status: "Incomplete",
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Task.countDocuments({
      priority: "high",
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Task.countDocuments({
      priority: "medium",
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Task.countDocuments({
      priority: "low",
      createdAt: { $gte: thirtyDaysAgo },
    }),

    // 4) tasks all time
    Task.countDocuments({ locked: true }),
    Task.countDocuments({ dueDate: { $lt: new Date() } }), // you called this overDueTasks
    Task.countDocuments(),
    Task.countDocuments({ status: "Complete" }),
    Task.countDocuments({ status: "Incomplete" }),
    Task.countDocuments({ priority: "high" }),
    Task.countDocuments({ priority: "medium" }),
    Task.countDocuments({ priority: "low" }),

    // 5) top 10 users by completed tasks
    Task.aggregate([
      {
        $match: {
          status: "Complete",
          completedBy: { $ne: null },
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$completedBy",
          tasksCompleted: { $sum: 1 },
        },
      },
      { $sort: { tasksCompleted: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          tasksCompleted: 1,
          userName: "$userInfo.name",
          userEmail: "$userInfo.email",
        },
      },
    ]),
  ]);

  return res.status(200).json({
    userMetrics: {
      totalUsers: totalUsers - totalAdmins,
      totalAdmins,
      // Some additional metrics or ratio: userCompletionRate, etc.
    },
    taskMetrics: {
      thirtyDays: {
        totalTasks_30d,
        completedTasks_30d,
        incompleteTasks_30d,
        tasksByPriority: {
          high: highPriorityTasks_30d,
          medium: mediumPriorityTasks_30d,
          low: lowPriorityTasks_30d,
        },
      },
      allTime: {
        lockedTasks,
        overDueTasks,
        totalTasks,
        completedTasks,
        incompleteTasks,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
      },
    },
    topUsersByCompletedTasks_30d, // This is the array you can feed to your bar chart
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
  addAssignee,
  removeAssignee,
  getMetrics,
};
