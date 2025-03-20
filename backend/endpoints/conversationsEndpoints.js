const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationsController");
const app = require("../app");
const { verifyJWT } = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(conversationController.getAllConversations)
  .post(conversationController.createConversation);

router
  .route("/:conversationId/messages")
  .get(conversationController.getMessages)
  .post(conversationController.createMessage);

// Add the clear conversation endpoint
router.delete("/:conversationId/clear", conversationController.clearConversation);

module.exports = router;
