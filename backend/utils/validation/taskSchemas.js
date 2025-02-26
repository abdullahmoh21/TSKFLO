const Joi = require("joi");

const taskIdSchema = Joi.object({
  taskId: Joi.string().length(24).hex().required(),
});

const assigneeIdSchema = Joi.object({
  assigneeId: Joi.string().length(24).hex().required(),
});

// For validating a new task being created
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(3).max(500).required(),
  priority: Joi.string().valid("high", "medium", "low").required(),
  dueDate: Joi.date().greater("now").required(),
  assignees: Joi.array().items(Joi.string().length(24).hex()),
});

// For validating task updates
const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(3).max(500),
  priority: Joi.string().valid("high", "medium", "low"),
  status: Joi.string().valid("Complete", "Incomplete"),
  dueDate: Joi.date().greater("now"),
  assignees: Joi.array().items(Joi.string().length(24).hex()),
  owner: Joi.forbidden().messages({
    "any.unknown": "The 'owner' field cannot be edited",
  }),
  assignees: Joi.forbidden().messages({
    "any.unknown":
      "The 'assignees' field cannot be edited. Please edit via POST tasks/:taskId/assignee",
  }),
});

module.exports = {
  taskIdSchema,
  assigneeIdSchema,
  createTaskSchema,
  updateTaskSchema,
};
