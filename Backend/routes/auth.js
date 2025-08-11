const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

router.post('/register', async (req, res) => {
  try {
    if (req.user) {
      // If user is already authenticated, return existing session token
      const token = createToken(req.user._id);
      return res.status(200).json({ message: 'Already authenticated', user: req.user, token });
    }

    const { f_name, l_name, username, email, password, age, city, country, phoneNumber } = req.body;

    if (!f_name || !l_name || !username || !email || !password) {
      return res.status(400).json({ message: 'f_name, l_name, username, email, and password are required' });
    }

    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) return res.status(400).json({ message: 'User with this email already exists' });

    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) return res.status(400).json({ message: 'Username not available' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      f_name,
      l_name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      age,
      city,
      country,
      phoneNumber,
    });

    const token = createToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    req.login(user, (err) => {
      if (err) console.error(err);
      return res.status(201).json({ message: 'User registered', user: { id: user._id, f_name: user.f_name, l_name: user.l_name, username: user.username, email: user.email } });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (req.user) {
      // If user is already authenticated, return existing session token
      const token = createToken(req.user._id);
      return res.status(200).json({ message: 'Already authenticated', user: req.user, token });
    }

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    req.login(user, (err) => {
      if (err) console.error(err);
      return res.json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/', session: true }),
  (req, res) => {
    const token = createToken(req.user._id);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    // Prepare user data for frontend localStorage
    const userData = {
      id: req.user._id,
      f_name: req.user.f_name,
      l_name: req.user.l_name,
      username: req.user.username,
      email: req.user.email,
      age: req.user.age,
      city: req.user.city,
      country: req.user.country,
      phoneNumber: req.user.phoneNumber,
      numberOfTrips: req.user.numberOfTrips,
      placesVisited: req.user.placesVisited,
      recentlyVisited: req.user.recentlyVisited,
    };

    // Redirect to a specific frontend callback route with token and user data
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.clearCookie('token');
    res.redirect(process.env.FRONTEND_URL || '/');
  });
});

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  res.json({
    id: req.user._id,
    f_name: req.user.f_name,
    l_name: req.user.l_name,
    username: req.user.username,
    email: req.user.email,
    age: req.user.age,
    city: req.user.city,
    country: req.user.country,
    phoneNumber: req.user.phoneNumber,
    numberOfTrips: req.user.numberOfTrips,
    placesVisited: req.user.placesVisited,
    recentlyVisited: req.user.recentlyVisited,
  });
});

// Middleware to protect routes
const protect = (req, res, next) => {
  // Check if user is authenticated (e.g., via passport session or token)
  if (req.isAuthenticated()) {
    return next();
  }

  // If not authenticated, check for token in headers (for API calls)
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      User.findById(decoded.userId)
        .then(user => {
          if (!user) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
          }
          req.user = user;
          next();
        })
        .catch(err => res.status(401).json({ message: 'Not authorized, token failed', error: err.message }));
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Update user profile
router.put('/users/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, age, city, phoneNumber, gender, placesVisited, profilePhoto } = req.body;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Not authorized to update this user profile' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUserByUsername && existingUserByUsername._id.toString() !== id) {
        return res.status(400).json({ message: 'Username not available' });
      }
      user.username = username.toLowerCase();
    }

    user.age = age !== undefined ? age : user.age;
    user.city = city !== undefined ? city : user.city;
    user.phoneNumber = phoneNumber !== undefined ? phoneNumber : user.phoneNumber;
    user.gender = gender !== undefined ? gender : user.gender;
    user.placesVisited = placesVisited !== undefined ? placesVisited : user.placesVisited;
    user.profilePhoto = profilePhoto !== undefined ? profilePhoto : user.profilePhoto;

    const updatedUser = await user.save();

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
});

module.exports = router;
