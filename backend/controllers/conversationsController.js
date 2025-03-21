const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const asyncHandler = require("express-async-handler");
const logger = require("../logs/logger");

//@desc returns all conversations to be displayed in inbox
//@param {Object} req with valid JWT
//@route GET /conversation
//@access Private
const getAllConversations = asyncHandler(async (req, res) => {
  // Find all conversations where the user is a participant
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate("participants", "name email _id")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return res.status(200).json(conversations);
});

//@desc creates a new conversation
//@param {Object} req with valid JWT
//@route POST /conversation
//@access Private
const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { participants, groupName } = req.body;

  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length <= 1
  ) {
    return res.status(400).json({
      message: "Participants should be an array of at least 2 users.",
    });
  }

  if (participants.length > 2 && !groupName) {
    return res.status(400).json({
      message: "Conversations with more than two people must have a group name",
    });
  }

  // Ensure the current user is in the conversation
  if (!participants.includes(userId.toString())) {
    participants.push(userId);
  }

  // Create the conversation
  const newConversation = await Conversation.create({
    participants,
    groupName,
  });

  // Emit a WebSocket event to the conversation participants
  const io = req.app.get("socketIo");
  participants.forEach((participantId) => {
    io.to(participantId.toString()).emit(
      "conversationCreated",
      newConversation
    );
  });

  return res.status(201).json(newConversation);
});

//@desc Gets messages of a specific conversation
//@param {Object} req with valid JWT and conversation ID
//@route GET /:conversationId/messages
//@access Private
const getMessages = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const userId = req.user.id;

  // Make sure conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  // Ensure the user is a participant
  if (!conversation.participants.includes(userId)) {
    return res.status(403).json({
      message: "Not authorized to view messages of this conversation",
    });
  }

  // Retrieve messages
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "_id name email")
    .sort({ createdAt: 1 })
    .select("-updatedAt -__v");

  return res.status(200).json(messages);
});

//@desc creates a message in a conversation and emits a websocket event
//@param {Object} req with valid JWT, conversation ID, and message
//@route POST /:conversationId/messages
//@access Private
const createMessage = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const userId = req.user.id;
  const { text } = req.body;

  let conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(400).json({
      message: "Conversation not found.",
    });
  }

  // Ensure this user is a participant
  if (!conversation.participants.includes(userId)) {
    return res.status(403).json({
      message: "Not authorized to post messages to this conversation",
    });
  }

  // Create the message
  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    text,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "_id name email"
  );

  // Update the conversation's lastMessage
  conversation.lastMessage = message._id;
  await conversation.save();

  // Emit a WebSocket event for the new message
  const io = req.app.get("socketIo");
  io.in(conversationId.toString()).emit("messageCreated", populatedMessage);

  return res.status(201).json(message);
});

//@desc Deletes a conversation along with all its messages
//@param {Object} req with valid JWT and conversation ID
//@route DELETE /:conversationId/clear
//@access Private
const deleteConversation = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;

  if (!conversationId) {
    return res.status(400).json({ message: "Conversation Id is required." });
  }

  // Make sure conversation exists
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "_id name")
    .lean()
    .exec();
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  // Ensure the user is a participant
  if (!conversation.participants.find((user) => user._id == req.user.id)) {
    return res.status(403).json({
      message: "Not authorized to clear messages in this conversation",
    });
  }

  // Delete the conversation and corresponding messages
  await Promise.all([
    Message.deleteMany({ conversation: conversationId }).exec(),
    Conversation.deleteOne({ _id: conversationId }).exec(),
  ]);

  const deletedBy = conversation.participants.find(
    (user) => user._id == req.user.id
  );

  // Emit a WebSocket event to all participants
  const io = req.app.get("socketIo");
  io.in(conversationId.toString()).emit("conversationDeleted", {
    conversationId,
    deletedBy,
  });

  return res
    .status(200)
    .json({ message: "Conversation and corresponding messages deleted" });
});

module.exports = {
  getAllConversations,
  createConversation,
  getMessages,
  createMessage,
  deleteConversation,
};
