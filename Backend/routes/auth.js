const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/protect");
const {
  register,
  login,
  createToken,
  socialLogin,
  updateProfileDetails,
  addPastTravels,
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

router.get("/me", protect, asyncHandler(async (req, res) => {
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
}));

router.put("/profile-details", protect, updateProfileDetails);
router.put("/past-travels", protect, addPastTravels);

module.exports = router;
