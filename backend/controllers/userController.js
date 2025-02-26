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
};
