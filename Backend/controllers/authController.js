const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require("../utils/asyncHandler");
const crypto = require('crypto'); // Moved crypto import to top

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = asyncHandler(async (req, res) => {
  const { f_name, l_name, username, age, city, country, email, phoneNumber, password } = req.body;

  // Basic input validation
  if (!f_name || !l_name || !email || !password) {
    res.status(400);
    throw new Error('All required fields must be provided (first name, last name, email, password)');
  }

  // Removed age validation for initial registration

  // Basic email format validation
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

  // Conditionally check for username existence only if provided
  if (username) {
    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) {
      res.status(400);
      throw new Error('Username not available');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    f_name: f_name.trim(),
    l_name: l_name.trim(),
    username: username ? username.trim() : undefined, // Only include if provided
    age: age || undefined, // Only include if provided
    city: city ? city.trim() : undefined,
    country: country ? country.trim() : undefined,
    email: email.toLowerCase(),
    phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
    password: hashedPassword,
    numberOfTrips: 0,
    placesVisited: [],
    recentlyVisited: null
  });

  const token = createToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token }
  });
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
    // Register new user with a random password
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    user = await User.create({
      f_name: f_name.trim(),
      l_name: l_name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword, // Store a random hashed password
      // Other optional fields can be set to null or default initially
      username: null,
      age: null,
      city: null,
      country: null,
      phoneNumber: null,
    });
  }

  const token = createToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Social login successful',
    data: { user, token }
  });
});

module.exports = { register, login, createToken, socialLogin };
