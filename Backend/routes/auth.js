const express = require("express");
// const passport = require("passport"); // Removed
const User = require("../models/User");
const protect = require("../middleware/protect"); // Import protect middleware
const { register, login, googleAuthCallback, createToken } = require("../controllers/authController"); // Import register from authController
const asyncHandler = require("../utils/asyncHandler");
// const admin = require("../config/firebaseAdmin"); // Removed Firebase admin import

const router = express.Router();

// Removed the local createToken function

// Use the register function from authController
router.post("/register", register);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (req.user) {
      const token = createToken(req.user._id);
      return res
        .status(200)
        .json({ message: "Already authenticated", user: req.user, token });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none", // Changed to "none" for cross-origin requests
      secure: true, // Must be true when sameSite is "none"
    });

    // req.login(user, (err) => { // Removed Passport.js login
    //   if (err) console.error(err);
    return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          f_name: user.f_name,
          username: user.username,
          age: user.age,
          city: user.city,
        },
        token,
      });
    // }); // Removed Passport.js login
  })
);

// Removed Firebase authentication route
// router.post("/firebase-login", asyncHandler(async (req, res) => {
//   const { idToken } = req.body;

//   if (!idToken) {
//     res.status(400);
//     throw new Error("Firebase ID token is required");
//   }

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const { email, name, picture, family_name, given_name } = decodedToken;

//     let user = await User.findOne({ email });

//     if (!user) {
//       const f_name = given_name || name.split(' ')[0] || 'User';
//       const l_name = family_name || name.split(' ').slice(1).join(' ') || '';

//       user = new User({
//         email,
//         f_name,
//         l_name,
//         username: null,
//         age: null,
//         city: null,
//         country: null,
//         phoneNumber: null,
//         profilePhoto: picture || null,
//       });
//       await user.save();
//     }

//     const token = createToken(user._id);
//     res.cookie("token", token, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       sameSite: "none",
//       secure: true,
//     });

//     res.status(200).json({
//       message: "Firebase login successful",
//       user: {
//         id: user._id,
//         f_name: user.f_name,
//         l_name: user.l_name,
//         email: user.email,
//         username: user.username,
//         age: user.age,
//         city: user.city,
//         country: user.country,
//         phoneNumber: user.phoneNumber,
//         profilePhoto: user.profilePhoto,
//       },
//       token,
//     });

//   } catch (error) {
//     res.status(401);
//     throw new Error(`Firebase authentication failed: ${error.message}`);
//   }
// }));

// Removed Google OAuth routes
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/", session: true }),
//   (req, res) => {
//     const token = createToken(req.user._id);
//     res.cookie("token", token, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       sameSite: "none",
//       secure: true,
//     });
//     const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback`;
//     res.redirect(redirectUrl);
//   }
// );

router.get("/logout", (req, res) => {
  // req.logout(() => { // Removed Passport.js logout
    res.clearCookie("token");
    res.redirect(process.env.FRONTEND_URL || "/");
  // }); // Removed Passport.js logout
});

router.post(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
      "f_name l_name phoneNumber city age recentlyVisited placesVisited email numberOfTrips"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
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
  })
);

// No longer defining 'protect' middleware here. It's imported from Backend/middleware/protect.js

router.put(
  "/users/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, age, city, phoneNumber, gender } = req.body;

    // Input validation for update fields
    if (username && (typeof username !== 'string' || username.trim().length < 3)) {
      res.status(400);
      throw new Error('Username must be a string of at least 3 characters.');
    }
    if (age !== undefined && (typeof age !== 'number' || age < 10 || age > 100)) {
      res.status(400);
      throw new Error('Age must be a number between 10 and 100.');
    }
    if (city && (typeof city !== 'string' || city.trim().length < 2)) {
      res.status(400);
      throw new Error('City must be a string of at least 2 characters.');
    }
    if (phoneNumber && (typeof phoneNumber !== 'string' || !/^[0-9]{10}$/.test(phoneNumber))) {
      res.status(400);
      throw new Error('Phone number must be a 10-digit string.');
    }
    if (gender && (typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender.toLowerCase()))) {
      res.status(400);
      throw new Error('Gender must be one of \'male\', \'female\', or \'other\'.');
    }

    if (req.user._id.toString() !== id) {
      res.status(403);
      throw new Error("Not authorized to update this user profile");
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (username && username !== user.username) {
      const existingUserByUsername = await User.findOne({ username: username });
      if (
        existingUserByUsername &&
        existingUserByUsername._id.toString() !== id
      ) {
        res.status(400);
        throw new Error("Username not available");
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
  })
);

module.exports = router;
