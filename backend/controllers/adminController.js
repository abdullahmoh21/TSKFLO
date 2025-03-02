const User = require("../models/User");
const Invitation = require("../models/Invitation");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/emailTransporter");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//@desc returns list of all users with paging
//@param {Object} req with valid Admin JWT
//@route GET /admin/users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  let { page, limit } = req.query;

  // Convert page and limit to numbers, and set defaults if not provided
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Ensure page and limit are positive
  if (page < 1 || limit < 1) {
    return res
      .status(400)
      .json({ error: "Page and limit must be positive numbers." });
  }

  const skip = (page - 1) * limit;

  // Fetch paginated users
  const users = await User.find().skip(skip).limit(limit).lean().exec();

  // Get total number of users
  const totalUsers = await User.countDocuments();

  // Send response with pagination metadata
  res.json({
    totalUsers,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    users,
  });
});

//@desc Invites a new user to register
//@param {Object} req with valid user data
//@route POST /admin/users
//@access Private
const invite = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;

  const [invited, existingUser] = await Promise.all([
    Invitation.findOne({ email }).lean().exec(),
    User.findOne({ email }).lean().exec(),
  ]);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (invited) {
    return res.status(204).json({ message: "User has already been invited" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const newInvitation = new Invitation({
    email,
    name,
    token,
    role,
  });

  const link = `${process.env.URL}/register/${token}`;
  await newInvitation.save();
  try {
    await sendEmail(email, "inviteUser", { name, link });
  } catch (err) {
    print(err);
    // rollback if email sending failed
    await Invitation.deleteOne({ _id: newInvitation._id });
    return res
      .status(500)
      .json({ message: "Error sending email. Please try again later" });
  }

  return res.sendStatus(200);
});

//@desc Update given users data
//@param {Object} req with valid userId
//@route PATCH /admin/users/:userId
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, phone } = req.body;

  const updates = {
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
    ...(phone && { phone }),
  };
  const updatedUser = await User.findOneAndUpdate({ _id: userId }, updates, {
    new: true,
    runValidators: true,
  }).select("_id email phone role name");

  if (!updatedUser) {
    return res.status(404).json({ message: "No user found with this user ID" });
  }

  return res.status(200).json(updatedUser);
});

//@desc deletes given user
//@param {Object} req with valid userId
//@route DELETE /admin/users/:userId
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const deleted = await User.deleteOne({ _id: userId }).exec();
  if (deleted.deletedCount == 0) {
    return res.status(404).json({ message: "No user found with this user ID" });
  }

  res.sendStatus(200);
});

module.exports = {
  getAllUsers,
  invite,
  updateUser,
  deleteUser,
};
