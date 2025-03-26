const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const logger = require("../logs/logger");
const Invitation = require("../models/Invitation");

//@desc Assigns new jwt token
//@param {Object} req with valid email, password
//@route GET /auth
//@access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne(
    { email },
    "_id email name role password emailVerified lastLogin"
  ).exec();
  if (!foundUser) {
    return res.status(401).json({ message: "Invalid login credentials" }); // Avoid user enumeration
  }

  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid login credentials" }); // Consistent error message
  }

  if (foundUser?.emailVerified?.state === false) {
    return res.status(401).json({
      message: "Email not verified. Check your email for verification link",
    });
  }

  const accessToken = jwt.sign(
    {
      user: {
        id: foundUser._id,
        name: foundUser.name,
        role: foundUser.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      user: {
        id: foundUser._id,
        name: foundUser.name,
        role: foundUser.role,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3h" }
  );

  foundUser.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  foundUser.refreshTokenExp = Date.now() + 8 * 60 * 60 * 1000;
  foundUser.lastLogin = Date.now();
  await foundUser.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json({ accessToken });
});

// @desc Refresh
// @param cookie with token
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(401);

  let userId, decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    userId = decoded.user.id;
  } catch (err) {
    return err instanceof jwt.TokenExpiredError
      ? res.status(401).json({ message: "Refresh token expired" })
      : res.sendStatus(500); // Internal Server Error for other JWT errors
  }

  if (!decoded || !userId) return res.sendStatus(403); // Forbidden, email not found in token

  // Optimized database query with projection to minimize data retrieval
  const foundUser = await User.findOne(
    { _id: userId },
    "_id email name role refreshTokenHash"
  )
    .lean()
    .exec();
  if (!foundUser) return res.sendStatus(403); // Forbidden, user not found

  const isMatch = await bcrypt.compare(
    refreshToken,
    foundUser.refreshTokenHash
  );
  if (!isMatch) return res.sendStatus(403); // Forbidden, token mismatch

  const accessToken = jwt.sign(
    {
      user: {
        id: foundUser._id,
        name: foundUser.name,
        role: foundUser.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  console.log(`AccessToken refreshed!`);
  res.json({ accessToken });
});

//@desc creates a new user in the database IF user has been invited
//@param {Object} req with valid email, password
//@route POST /auth/register
//@access Public
const register = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Check if a user with this email already exists
  const invitation = await Invitation.findOne({ token }).exec();
  if (!invitation) {
    return res.status(400).json({ message: "No invitation for this token" });
  }

  const userExists = await User.findOne({ email: invitation.email });
  if (userExists) {
    return res.status(409).json({ message: "User already created" });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const newUser = new User({
    email: invitation.email,
    name: invitation.name,
    role: invitation.role,
    password: hashedPassword,
  });

  await newUser.save();
  await Invitation.deleteOne({ _id: invitation._id });

  res.status(200).json({ message: "User created successfully" });
});

// @desc Logout
// @route POST /auth/logout
// @access Public - clear cookie if exists
const logout = asyncHandler(async (req, res) => {
  //delete Access Token on client side
  if (!req.cookies?.refreshToken) return res.sendStatus(204); //no content
  const refreshToken = req.cookies.refreshToken;

  let decoded;
  try {
    // Decode the refresh token
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.sendStatus(204);
  }

  if (!decoded?.user) return res.sendStatus(204); // no content

  // is user in db?
  const foundUser = await User.findOne({
    _id: decoded.user.id,
  }).exec();
  if (!foundUser) return res.sendStatus(204); // no content

  //delete refresh token in db
  foundUser.refreshTokenHash = "";
  foundUser.refreshTokenExp = 0;
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); //ADD secure: true in production
  res.sendStatus(200); //no content
});

module.exports = {
  login,
  refresh,
  register,
  logout,
};
