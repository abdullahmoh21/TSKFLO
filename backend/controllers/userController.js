const logger = require("../logs/logger");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//@desc get users own data
//@route GET /user
//@access Private
const getUserData = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user.id })
    .select("_id email phone role name")
    .lean()
    .exec();
  if (!user) return res.status(204).json({ message: "No users found" });
  res.json(user);
});

//@desc Update users own data
//@param {Object} req with valid new data
//@route PATCH /user
//@access Private
const updateUserData = asyncHandler(async (req, res) => {
  const newData = req.body;
  // whitelist of fields that can be updated
  const allowedUpdates = ["name", "email", "phone"];

  // filter out any fields that are not allowed to be edited
  const updates = Object.keys(newData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = newData[key];
      return obj;
    }, {});

  // Check if there are any valid updates
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.id },
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).select("_id email phone role name");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(updatedUser);
});

//@desc search's the db for users with that name or email
//@param {Object} req with valid JWT
//@route GET /user/search?query=${name}
//@access Private
const searchUser = asyncHandler(async (req, res) => {
  let { query, page, limit } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query parameter is required." });
  }

  // Convert page and limit to numbers, and set defaults if not provided
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  if (page < 1 || limit < 1) {
    return res
      .status(400)
      .json({ error: "Page and limit must be positive numbers." });
  }

  const skip = (page - 1) * limit;

  try {
    const filter = {
      $or: [
        { name: { $regex: `^${query}`, $options: "i" } },
        { email: { $regex: `^${query}`, $options: "i" } },
      ],
    };

    // Fetch matching users with pagination
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .lean()
      .select("_id name email")
      .exec();

    // Count total matching users
    const totalUsers = await User.countDocuments(filter);

    res.json({
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  getUserData,
  updateUserData,
  searchUser,
};
