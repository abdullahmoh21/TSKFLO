const Joi = require("joi");

/**
 * Generic schema for a 24-char hex string (Mongo ObjectId).
 * You can reuse this for userId, taskId, etc.
 */
const objectIdSchema = Joi.string().hex().length(24).required();

/**
 * Pagination schema (used for GET /admin/users and GET /admin/tasks)
 * Ensures `page` and `limit` are positive integers, with defaults if omitted.
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
});

/**
 * POST /admin/users -> invite
 * Validate the body fields needed to invite a user.
 */
const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid("admin", "user").required(),
});

/**
 * PATCH /admin/users/:userId -> updateUser
 * Validate the body fields for updating user data.
 */
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().min(7).max(20), // adjust bounds as you wish
  role: Joi.string().valid("admin", "user"),
})
  // At least one field must be provided
  .min(1);

/**
 * POST /admin/tasks -> createTask
 * Validate the body fields for creating a new task.
 */
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(3).max(500).required(),
  priority: Joi.string().valid("high", "medium", "low").required(),
  dueDate: Joi.date().greater("now").required(),
  assignees: Joi.array().items(objectIdSchema).default([]),
});

/**
 * PATCH /admin/tasks/:taskId -> updateTask
 * Validate the body fields for updating a task.
 * Notice that 'owner' and 'assignees' fields are forbidden.
 */
const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(3).max(500),
  priority: Joi.string().valid("high", "medium", "low"),
  status: Joi.string().valid("Complete", "Incomplete"),
  dueDate: Joi.date().greater("now"),
  // Make sure 'owner' isn't edited
  owner: Joi.forbidden().messages({
    "any.unknown": "The 'owner' field cannot be edited",
  }),
  // Make sure 'assignees' isn't edited this way
  assignees: Joi.forbidden().messages({
    "any.unknown":
      "The 'assignees' field cannot be edited. Use the dedicated endpoint instead.",
  }),
}).min(1);

/**
 * For route params:
 * /admin/users/:userId or /admin/tasks/:taskId
 */
const userIdParamSchema = Joi.object({
  userId: objectIdSchema,
});

const taskIdParamSchema = Joi.object({
  taskId: objectIdSchema,
});

// Export everything you need for the controllers:
module.exports = {
  paginationSchema,
  userIdParamSchema,
  taskIdParamSchema,
  inviteUserSchema,
  updateUserSchema,
  createTaskSchema,
  updateTaskSchema,
};
