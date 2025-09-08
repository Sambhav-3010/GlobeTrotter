const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/protect");
const {
  register,
  login,
  createToken,
  socialLogin,
} = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/social-login", socialLogin);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect(process.env.FRONTEND_URL || "/");
});

router.post(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
      "f_name l_name phoneNumber city age recentlyVisited email numberOfTrips"
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

router.put(
  "/users/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, age, city, phoneNumber, gender } = req.body;

    if (
      username &&
      (typeof username !== "string" || username.trim().length < 3)
    ) {
      res.status(400);
      throw new Error("Username must be a string of at least 3 characters.");
    }
    if (
      age !== undefined &&
      (typeof age !== "number" || age < 10 || age > 100)
    ) {
      res.status(400);
      throw new Error("Age must be a number between 10 and 100.");
    }
    if (city && (typeof city !== "string" || city.trim().length < 2)) {
      res.status(400);
      throw new Error("City must be a string of at least 2 characters.");
    }
    if (
      phoneNumber &&
      (typeof phoneNumber !== "string" || !/^[0-9]{10}$/.test(phoneNumber))
    ) {
      res.status(400);
      throw new Error("Phone number must be a 10-digit string.");
    }
    if (
      gender &&
      (typeof gender !== "string" ||
        !["male", "female", "other"].includes(gender.toLowerCase()))
    ) {
      res.status(400);
      throw new Error("Gender must be one of 'male', 'female', or 'other'.");
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
