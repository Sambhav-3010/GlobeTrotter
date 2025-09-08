const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require("../utils/asyncHandler");
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper for setting cookies
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,             // must be true if frontend is on https
    sameSite: "none",         // required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = asyncHandler(async (req, res) => {
  const { f_name, l_name, email, password } = req.body;

  if (!f_name || !l_name || !email || !password) {
    res.status(400);
    throw new Error('All required fields must be provided (first name, last name, email, password)');
  }

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingUserByEmail) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    f_name: f_name.trim(),
    l_name: l_name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    numberOfTrips: 0,
    placesVisited: [],
    recentlyVisited: null
  });

  const token = createToken(user._id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token }
  });
});

const updateProfileDetails = asyncHandler(async (req, res) => {
  const { username, age, city, phoneNumber, gender } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (username && (typeof username !== "string" || username.trim().length < 3)) {
    res.status(400);
    throw new Error("Username must be a string of at least 3 characters.");
  }
  if (age !== undefined && (typeof age !== "number" || age < 10 || age > 100)) {
    res.status(400);
    throw new Error("Age must be a number between 10 and 100.");
  }
  if (city && (typeof city !== "string" || city.trim().length < 2)) {
    res.status(400);
    throw new Error("City must be a string of at least 2 characters.");
  }
  if (phoneNumber && (typeof phoneNumber !== "string" || !/^[0-9]{10}$/.test(phoneNumber))) {
    res.status(400);
    throw new Error("Phone number must be a 10-digit string.");
  }
  if (gender && (typeof gender !== "string" || !["male", "female", "other"].includes(gender.toLowerCase()))) {
    res.status(400);
    throw new Error("Gender must be one of 'male', 'female', or 'other'.");
  }

  if (username && username !== user.username) {
    const existingUserByUsername = await User.findOne({ username: username });
    if (existingUserByUsername && existingUserByUsername._id.toString() !== userId.toString()) {
      res.status(400);
      throw new Error("Username not available");
    }
    user.username = username;
  }

  user.age = age !== undefined ? age : user.age;
  user.city = city !== undefined ? city : user.city;
  user.phoneNumber = phoneNumber !== undefined ? phoneNumber : user.phoneNumber;
  user.gender = gender !== undefined ? gender : user.gender;

  const updatedUser = await user.save();

  res.json({ message: "Profile updated successfully", user: updatedUser });
});

const addPastTravels = asyncHandler(async (req, res) => {
  const { placesVisited } = req.body;
  const userId = req.user._id;

  if (!placesVisited || !Array.isArray(placesVisited) || placesVisited.length === 0) {
    res.status(400);
    throw new Error("Please provide an array of places visited.");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.placesVisited = placesVisited;
  const updatedUser = await user.save();

  res.json({ message: "Past travels added successfully", user: updatedUser });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || '');
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = createToken(user._id);
  setAuthCookie(res, token);

  res.json({ success: true, message: 'Login successful', data: { user, token } });
});

const socialLogin = asyncHandler(async (req, res) => {
  const { f_name, l_name, email } = req.body;

  if (!f_name || !l_name || !email) {
    res.status(400);
    throw new Error('First name, last name, and email are required for social login.');
  }

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    user = await User.create({
      f_name: f_name.trim(),
      l_name: l_name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });
  }

  const token = createToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: 'Social login successful',
    data: { user, token }
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { register, login, createToken, socialLogin, updateProfileDetails, addPastTravels, logout };
