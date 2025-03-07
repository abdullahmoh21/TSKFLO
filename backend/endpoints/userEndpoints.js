const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(userController.getUserData)
  .patch(userController.updateUserData);

// Routes for getting user lists
router.route("/users/all").get(userController.getAllUsers); // For assignment
router.route("/all").get(userController.listAllUsers); // For pagination

module.exports = router;
