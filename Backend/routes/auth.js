const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

router.post("/register", async (req, res) => {
  try {
    if (req.user) {
      const token = createToken(req.user._id);
      return res
        .status(200)
        .json({ message: "Already authenticated", user: req.user, token });
    }

    const {
      f_name,
      l_name,
      email,
      password,
      age,
      city,
      country,
      phoneNumber,
      username,
    } = req.body;

    if (!f_name || !l_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "f_name, l_name, email, and password are required" });
    }

    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      f_name,
      l_name,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      age,
      city,
      country,
      phoneNumber,
    });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none", // Changed to "none" for cross-origin requests
      secure: true, // Must be true when sameSite is "none"
    });

    req.login(user, (err) => {
      if (err) console.error(err);
      return res.status(201).json({
        message: "User registered",
        user: {
          id: user._id,
          f_name: user.f_name,
          l_name: user.l_name,
          username: user.username,
          email: user.email,
          city: user.city,
        },
        token,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (req.user) {
      const token = createToken(req.user._id);
      return res
        .status(200)
        .json({ message: "Already authenticated", user: req.user, token });
    }

    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none", // Changed to "none" for cross-origin requests
      secure: true, // Must be true when sameSite is "none"
    });

    req.login(user, (err) => {
      if (err) console.error(err);
      return res.json({
        message: "Login successful",
        user: {
          id: req.user._id,
          f_name: req.user.f_name,
          username: req.user.username,
          age: req.user.age,
          city: req.user.city,
        },
        token,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  (req, res) => {
    const token = createToken(req.user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none", // Changed to "none" for cross-origin requests
      secure: true, // Must be true when sameSite is "none"
    });

    // Prepare user data for frontend localStorage
    const userData = {
      id: req.user._id,
      f_name: req.user.f_name,
      username: req.user.username,
      age: req.user.age,
    };

    // Redirect to a specific frontend callback route with token and user data
    const redirectUrl = `${
      process.env.FRONTEND_URL
    }/auth/google/callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("token");
    res.redirect(process.env.FRONTEND_URL || "/");
  });
});

router.post("/me", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id).select(
      "f_name l_name phoneNumber city age recentlyVisited placesVisited email numberOfTrips"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      fullName: `${user.f_name} ${user.l_name}`,
      phoneNumber: user.phoneNumber,
      city: user.city,
      email: user.email,
      numberOfTrips: user.numberOfTrips,
      age: user.age,
      recentlyVisited: user.recentlyVisited,
      placesVisited: user.placesVisited,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to protect routes
const protect = (req, res, next) => {
  // Check if user is authenticated (e.g., via passport session or token)
  if (req.isAuthenticated()) {
    return next();
  }

  // If not authenticated, check for token in headers (for API calls)
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      User.findById(decoded.userId)
        .then((user) => {
          if (!user) {
            return res
              .status(401)
              .json({ message: "Not authorized, token failed" });
          }
          req.user = user;
          next();
        })
        .catch((err) =>
          res.status(401).json({
            message: "Not authorized, token failed",
            error: err.message,
          })
        );
    } catch (error) {
      res.status(401).json({
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

router.put("/users/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, age, city, phoneNumber, gender } = req.body;

    if (req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user profile" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const existingUserByUsername = await User.findOne({ username: username });
      if (
        existingUserByUsername &&
        existingUserByUsername._id.toString() !== id
      ) {
        return res.status(400).json({ message: "Username not available" });
      }
      user.username = username;
    }

    user.age = age !== undefined ? age : user.age;
    user.city = city !== undefined ? city : user.city;
    user.phoneNumber =
      phoneNumber !== undefined ? phoneNumber : user.phoneNumber;
    user.gender = gender !== undefined ? gender : user.gender;

    const updatedUser = await user.save();

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Profile update failed", error: err.message });
  }
});

module.exports = router;
