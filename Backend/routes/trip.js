const express = require("express");
const User = require("../models/User");
const router = express.Router();
const protect = require("../middleware/protect");

router.post("/history", protect, async (req, res) => {
  const { placesVisited, recentlyVisited, numberOfTrips } = req.body;
  console.log("Trip history data:", { placesVisited, recentlyVisited, numberOfTrips });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          placesVisited: Array.isArray(placesVisited) ? placesVisited : [],
          recentlyVisited: recentlyVisited || "",
          numberOfTrips: numberOfTrips || 0,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating trip history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;