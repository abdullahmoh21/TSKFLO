const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/verifyJWT");
const adminController = require("../controllers/adminController");

router.use(verifyAdmin);

router
  .route("/users")
  .get(adminController.getAllUsers)
  .post(adminController.invite);
router
  .route("/users/:userId")
  .patch(adminController.updateUser)
  .delete(adminController.deleteUser);

router
  .route("/tasks")
  .get(adminController.getAllTasks)
  .post(adminController.createTask);

router
  .route("tasks/:taskId")
  .get(adminController.getTask)
  .patch(adminController.updateTask)
  .delete(adminController.deleteTask);

module.exports = router;
