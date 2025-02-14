const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//@desc Assigns new jwt token
//@param {Object} req with valid email, password
//@route GET /auth
//@access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne(
    { email },
    "email role password emailVerified lastLogin"
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
      userInfo: {
        email: foundUser.email,
        role: foundUser.role,
        userId: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3h" }
  );

  foundUser.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  foundUser.refreshTokenExp = Date.now() + 8 * 60 * 60 * 1000;
  foundUser.lastLogin = Date.now();
  await foundUser.save();

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken });
});

// @desc Refresh
// @param cookie with token
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = asyncHandler(async (req, res) => {
  const { jwt: refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(401);

  let email;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    email = decoded.email;
  } catch (err) {
    return err instanceof jwt.TokenExpiredError
      ? res.status(401).json({ message: "Refresh token expired" })
      : res.sendStatus(500); // Internal Server Error for other JWT errors
  }

  if (!email) return res.sendStatus(403); // Forbidden, email not found in token

  // Optimized database query with projection to minimize data retrieval
  const foundUser = await User.findOne(
    { email },
    "_id email role refreshTokenHash"
  ).exec();
  if (!foundUser) return res.sendStatus(403); // Forbidden, user not found

  const isMatch = await bcrypt.compare(
    refreshToken,
    foundUser.refreshTokenHash
  );
  if (!isMatch) return res.sendStatus(403); // Forbidden, token mismatch

  const accessToken = jwt.sign(
    {
      userInfo: {
        email: foundUser.email,
        role: foundUser.role,
        userId: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  console.log(`AccessToken refreshed!`);
  res.json({ accessToken });
});

//@desc creates a new user in the database
//@param {Object} req with valid email, password
//@route POST /auth/register
//@access Public
const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing field: email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Missing field: password" });
  }
  if (!name) {
    return res.status(400).json({ message: "Missing field: name" });
  }

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const newUser = new User({
    email,
    name,
    password: hashedPassword,
    role: process.env.USER_ROLE,
  });

  await newUser.save();

  res.status(201).json({ message: "User created successfully" });
});

// @desc Logout
// @route POST /auth/logout
// @access Public - clear cookie if exists
const logout = asyncHandler(async (req, res) => {
  //delete Access Token on client side
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //no content

  const refreshToken = cookies.jwt;

  // Decode the refresh token
  const decodedRefreshToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const { email } = decodedRefreshToken;
  if (!email) return res.sendStatus(204); // no content

  // is user in db?
  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) return res.sendStatus(204); // no content

  //delete refresh token in db
  foundUser.refreshTokenHash = "";
  foundUser.refreshTokenExp = 0;
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); //ADD secure: true in production
  res.sendStatus(204); //no content
});

module.exports = {
  login,
  refresh,
  register,
  logout,
};
