const User = require("../models/User");
const asyncHandler = require("express-async-handler"); //middleware to handle exceptions

//@desc get users own data
//@route GET /users/me
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
//@route PATCH /users/me
//@access Private
const updateUserData = asyncHandler(async (req, res) => {
  const newData = req.body;
  // whitelist of fields that can be updated
  const allowedUpdates = ["name", "phone"];

  // filter out any fields that are not allowed to be edited
  const updates = Object.keys(newData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = newData[key];
      return obj;
    }, {});

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.id },
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).select("_id email phone role DOB name");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(updatedUser);
});

module.exports = {
  getUserData,
  updateUserData,
  getAllUsers,
};
