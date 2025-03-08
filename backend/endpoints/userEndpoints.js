const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(userController.getUserData)
  .patch(userController.updateUserData);

// Route for getting paginated user list
router.route("/all").get(userController.listAllUsers);

module.exports = router;
