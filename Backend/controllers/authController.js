const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require("../utils/asyncHandler");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = asyncHandler(async (req, res) => {
    const { f_name, l_name, username, age, city, country, email, phoneNumber, password } = req.body;

    // Basic input validation
    if (!f_name || !l_name || !username || !email || !password) {
        res.status(400);
        throw new Error('All required fields must be provided (first name, last name, username, email, password)');
    }

    if (typeof age !== 'number' || age < 10 || age > 100) { // Example age range
        res.status(400);
        throw new Error('Age must be a number between 10 and 100');
    }

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

    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) {
        res.status(400);
        throw new Error('Username not available');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        f_name: f_name.trim(),
        l_name: l_name.trim(),
        username: username.trim(),
        age,
        city: city?.trim(),
        country: country?.trim(),
        email: email.toLowerCase(),
        phoneNumber: phoneNumber?.trim(),
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

const googleAuthCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            let uniqueUsername = profile.displayName;
            let usernameExists = await User.findOne({ username: uniqueUsername });
            let counter = 1;
            while (usernameExists) {
                uniqueUsername = `${profile.displayName}${counter}`;
                usernameExists = await User.findOne({ username: uniqueUsername });
                counter++;
            }

            const nameParts = profile.displayName.split(' ');
            const f_name = nameParts[0] || '';
            const l_name = nameParts.slice(1).join(' ') || '';

            user = await User.create({
                f_name: f_name,
                l_name: l_name,
                username: uniqueUsername,
                age: null,
                city: '',
                country: '',
                email,
                phoneNumber: '',
                password: Math.random().toString(36).slice(-8),
                numberOfTrips: 0,
                placesVisited: [],
                recentlyVisited: null
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
};

module.exports = { register, login, googleAuthCallback, createToken };
