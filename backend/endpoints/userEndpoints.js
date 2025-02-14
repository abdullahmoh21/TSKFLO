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

module.exports = router;
