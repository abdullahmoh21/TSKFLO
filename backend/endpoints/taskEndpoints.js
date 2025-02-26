const express = require("express");
const router = express.Router();
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  assigneeIdSchema,
} = require("../utils/validation/taskSchemas");
const taskController = require("../controllers/taskController");
const { verifyJWT } = require("../middleware/verifyJWT");

// All routes are protected
router.use(verifyJWT);

router
  .route("/")
  .get(taskController.getUserTasks)
  .post(validator.body(createTaskSchema), taskController.createTask);

router
  .route("/:taskId")
  .get(validator.params(taskIdSchema), taskController.getTask)
  .patch(
    validator.params(taskIdSchema),
    validator.body(updateTaskSchema),
    taskController.updateTask
  )
  .delete(validator.params(taskIdSchema), taskController.deleteTask);

router
  .route("/:taskId/assignees")
  .patch(
    validator.params(taskIdSchema),
    validator.body(assigneeIdSchema),
    taskController.addAssignee
  )
  .delete(
    validator.params(taskIdSchema),
    validator.body(assigneeIdSchema),
    taskController.removeAssignee
  );

module.exports = router;
