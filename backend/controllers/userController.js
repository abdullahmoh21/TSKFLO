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

//@desc Get all users for assignment
//@route GET /users/all
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  console.log('Getting all users...');
  try {
    const users = await User.find({})
      .select("_id email name")
      .lean()
      .exec();
    
    console.log('Found users:', users);
    
    if (!users?.length) {
      console.log('No users found');
      return res.status(200).json({ users: [] });
    }
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
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

//@desc return a list of all users and there _id's (only selected fields)
//@param {Object} req with valid JWT
//@route GET /user/all
//@access Private
const listAllUsers = asyncHandler(async (req, res) => {
  let { page, limit } = req.query;

  // Convert page and limit to numbers, and set defaults if not provided
  // Parse values
  page = parseInt(page);
  limit = parseInt(limit);

  // Set defaults for undefined/NaN values, not for 0
  if (isNaN(page)) page = 1;
  if (isNaN(limit)) limit = 10;

  // Ensure page and limit are positive
  if (page < 1 || limit < 1) {
    return res
      .status(400)
      .json({ error: "Page and limit must be positive numbers." });
  }

  const skip = (page - 1) * limit;

  // Fetch paginated users
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .lean()
    .select("_id name")
    .exec();

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

module.exports = {
  getUserData,
  updateUserData,
  getAllUsers,
  listAllUsers,
};
