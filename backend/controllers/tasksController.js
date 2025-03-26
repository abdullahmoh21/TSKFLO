const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");
const logger = require("../logs/logger");
const sendEmail = require("../utils/emailTransporter");

//@desc Returns list of tasks user owns or is assigned to
//@param {Object} req with valid userId
//@route GET /tasks
//@access Private
const getUserTasks = asyncHandler(async (req, res) => {
  try {
    let { page, limit, status, priority, taskRelation, hideCompleted } =
      req.query;

    // Parse pagination parameters
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 9; // Default to 9 for 3x3 grid
    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ error: "Page and limit must be positive numbers." });
    }
    const skip = (page - 1) * limit;

    const user = await User.findOne({ _id: req.user.id }).lean().exec();

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found for provided email" });
    }

    // Build the query based on filters
    const query = {
      $or: [{ owner: user._id }, { assignees: user._id }],
    };

    // Apply status filter
    if (status) {
      if (status === "To Do") {
        query.status = "Incomplete";
      } else if (status === "Done") {
        query.status = "Complete";
      }
    }

    // Apply priority filter (convert to lowercase for case-insensitive matching)
    if (priority) {
      query.priority = priority.toLowerCase();
    }

    // Apply task relationship filter
    if (taskRelation) {
      if (taskRelation === "created") {
        // Override the default query to only include tasks created by the user
        query.$or = [{ owner: user._id }];
      } else if (taskRelation === "assigned") {
        // Override the default query to only include tasks assigned to the user
        query.$or = [{ assignees: user._id }];
      }
    }

    // Apply hide completed filter
    if (hideCompleted === "true") {
      query.status = "Incomplete";
    }

    // Fetch paginated tasks with populate for owner and assignees
    const tasks = await Task.find(query)
      .populate("owner", "name")
      .populate("assignees", "name")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Get total number of tasks matching the query
    const totalTasks = await Task.countDocuments(query);

    return res.status(200).json({
      totalTasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      tasks,
    });
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

  const user = await User.findById(req.user.id).lean().exec();
  if (!user) {
    return res
      .status(404)
      .json({ message: "Requester's User not found in DB" });
  }

  let validAssignees = [];
  if (assignees && Array.isArray(assignees) && assignees.length > 0) {
    // Validate that each assignee exists
    validAssignees = await User.find({ _id: { $in: assignees } })
      .lean()
      .exec();
    if (validAssignees.length !== assignees.length) {
      return res
        .status(400)
        .json({ message: "One or more assignees not found" });
    }
  }

  const newTask = new Task({
    title,
    description,
    priority,
    dueDate,
    status: "Incomplete",
    owner: req.user.id,
    assignees, // storing user IDs
  });
  await newTask.save();

  // Send an email to each assignee after creating the task
  if (validAssignees.length > 0) {
    try {
      const assigneeNames = validAssignees.map((assignee) => assignee.name);
      for (const a of validAssignees) {
        const emailData = {
          name: a.name,
          taskName: newTask.title,
          adder: user.name,
          assignees: assigneeNames,
        };
        try {
          await sendEmail(a.email, "AssigneeAdded", emailData);
        } catch (emailError) {
          logger.error("Error sending email:", emailError);
          // Continue with next assignee, don't fail the task creation
        }
      }
    } catch (err) {
      logger.error("Error processing emails:", err);
      // Don't fail the task creation if emails fail
    }
  }

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

  if (newData?.status === "Complete") {
    logger.debug(`setting completedBy to: ${req.user.id}`);
    task.completedBy = req.user.id;
    task.completedAt = new Date();
  } else if (newData?.status === "Incomplete") {
    logger.debug(`setting completedBy to: null`);
    task.completedBy = null;
    task.completedAt = null;
  }

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

  // get assignee and task if they exist
  const [assignee, task] = await Promise.all([
    User.findById(assigneeId).lean(),
    Task.findOne({ _id: taskId }).populate("assignees", "_id name").exec(),
  ]);

  // handle if neither exist
  if (!task) {
    return res.status(404).json({ message: "No such task found" });
  }
  if (!assignee) {
    return res.status(404).json({ message: "No user with provided ID exists" });
  }

  // make sure users can only edit assignee's on tasks they own
  if (req.user.role === "user" && task.owner != req.user.id) {
    return res
      .status(404)
      .json({ message: "Only task owners can edit assignees" });
  }

  if (task.assignees.some((a) => a._id.toString() === assigneeId)) {
    return res.status(204).json({ message: "No changes made" });
  }

  task.assignees.push(assigneeId);
  await task.save();

  try {
    // Get names of existing (populated) assignees only, excluding the new assignee
    const existingAssigneeNames = task.assignees
      .filter((a) => a.name && a._id.toString() !== assigneeId) // Filter out the new assignee
      .map((a) => a.name);

    // Add the new assignee name with (You) designation
    const allAssigneeNames = [
      ...existingAssigneeNames,
      assignee.name + " (You)",
    ];

    // Send Email alert to the new assignee
    const emailData = {
      name: assignee.name,
      taskName: task.title,
      adder: req.user.name,
      assignees: allAssigneeNames,
    };
    await sendEmail(assignee.email, "AssigneeAdded", emailData);
  } catch (emailError) {
    logger.error("Error sending email:", emailError);
    // Don't fail the API call if email fails
  }

  return res.status(200).json({ message: "Assignee added successfully", task });
});

//@desc Removes an assignee from a task, ensuring only owner can add
//@param {Object} req with valid userId, TaskId, and assignee ID
//@route DELETE /tasks/:taskId/assignees
//@access Private
const removeAssignee = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assigneeId } = req.body;

  const [assignee, task] = await Promise.all([
    User.findById(assigneeId).lean().exec(),
    Task.findOne({ _id: taskId }).exec(), // Removed populate since we only need IDs
  ]);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (!assignee) {
    return res.status(404).json({ message: "User not found" });
  }
  // make sure users can only edit assignee's on tasks they own
  if (req.user.role === "user" && task.owner != req.user.id) {
    return res
      .status(404)
      .json({ message: "Only task owners can edit assignees" });
  }
  if (!task.assignees.some((id) => id.toString() === assigneeId)) {
    return res.status(204).json({ message: "No changes made" });
  }

  // Remove the assignee from the task
  task.assignees = task.assignees.filter((id) => id.toString() !== assigneeId);
  await task.save();

  try {
    // Send Email alert to the removed assignee
    const emailData = {
      name: assignee.name,
      taskName: task.title,
      remover: req.user.name,
    };
    await sendEmail(assignee.email, "AssigneeRemoved", emailData);
  } catch (emailError) {
    logger.error("Error sending email:", emailError);
    // Don't fail the API call if email fails
  }

  return res
    .status(200)
    .json({ message: "Assignee removed successfully", task });
});

//@desc Returns metrics about tasks for the current user
//@param {Object} req with valid userId
//@route GET /tasks/metrics
//@access Private
const getTaskMetrics = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).lean().exec();

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found for provided email" });
    }

    // Build the query for tasks belonging to the user (owned or assigned)
    const query = {
      $or: [{ owner: user._id }, { assignees: user._id }],
    };

    // Get all the user's tasks
    const tasks = await Task.find(query).lean().exec();

    // Calculate metrics
    const totalTasks = tasks.length;
    const todoCount = tasks.filter((t) => t.status === "Incomplete").length;
    const doneCount = tasks.filter((t) => t.status === "Complete").length;
    const highPriorityCount = tasks.filter((t) => t.priority === "high").length;
    const mediumPriorityCount = tasks.filter(
      (t) => t.priority === "medium"
    ).length;
    const lowPriorityCount = tasks.filter((t) => t.priority === "low").length;

    const completionRate =
      totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return res.status(200).json({
      metrics: {
        totalTasks,
        todoCount,
        doneCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        completionRate,
      },
    });
  } catch (err) {
    console.error("Error in getTaskMetrics:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving task metrics", error: err.message });
  }
});

module.exports = {
  getUserTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
  getTaskMetrics, // Add the new function to exports
};
