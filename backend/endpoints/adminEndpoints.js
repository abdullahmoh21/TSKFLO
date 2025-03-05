const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyJWT");
const adminController = require("../controllers/adminController");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const {
  paginationSchema,
  userIdParamSchema,
  taskIdParamSchema,
  inviteUserSchema,
  updateUserSchema,
  createTaskSchema,
  updateTaskSchema,
} = require("../utils/validation/adminSchemas");

router.use(verifyAdmin);

router
  .route("/users")
  .get(validator.params(paginationSchema), adminController.getAllUsers)
  .post(validator.body(inviteUserSchema), adminController.invite);
router
  .route("/users/:userId")
  .patch(
    validator.params(userIdParamSchema),
    validator.body(updateUserSchema),
    adminController.updateUser
  )
  .delete(validator.params(userIdParamSchema), adminController.deleteUser);

router
  .route("/tasks")
  .get(validator.params(paginationSchema), adminController.getAllTasks)
  .post(validator.body(createTaskSchema), adminController.createTask);

router
  .route("/tasks/:taskId")
  .get(validator.params(taskIdParamSchema), adminController.getTask)
  .patch(
    validator.params(taskIdParamSchema),
    validator.body(updateTaskSchema),
    adminController.updateTask
  )
  .delete(validator.params(taskIdParamSchema), adminController.deleteTask);

router.route("/tasks/:taskId/lock").patch(adminController.lockTask);

router.route("/tasks/:taskId/unlock").patch(adminController.unlockTask);

router.route("/metrics").get(adminController.getMetrics);

module.exports = router;
