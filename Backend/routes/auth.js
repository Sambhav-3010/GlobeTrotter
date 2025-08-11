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
    const { username, email, password, age, city, country, phoneNumber } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
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
      return res.status(201).json({ message: 'User registered', user: { id: user._id, email: user.email, username: user.username } });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

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

    res.redirect(process.env.FRONTEND_URL || '/');
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
    email: req.user.email,
    username: req.user.username,
    age: req.user.age,
    city: req.user.city,
    country: req.user.country,
    phoneNumber: req.user.phoneNumber,
    numberOfTrips: req.user.numberOfTrips,
    placesVisited: req.user.placesVisited,
    recentlyVisited: req.user.recentlyVisited,
  });
});

module.exports = router;