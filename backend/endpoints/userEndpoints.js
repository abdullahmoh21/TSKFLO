const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/verifyJWT");

router.use(verifyJWT);
// protected routes
router
  .route("/")
  .get(userController.getUserData)
  .patch(userController.updateUserData);

// Add route for getting all users
router.route("/all").get(userController.getAllUsers);

module.exports = router;
