const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
    try {
        const { f_name, l_name, username, age, city, country, email, phoneNumber, password } = req.body;

        const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUserByUsername) {
            return res.status(400).json({ success: false, message: 'Username not available' });
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

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email' });

        const isPasswordValid = await bcrypt.compare(password, user.password || '');
        if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);

        res.json({ success: true, message: 'Login successful', data: { user, token } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

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

module.exports = { register, login, googleAuthCallback, generateToken };
