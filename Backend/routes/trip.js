const express = require("express");
const User = require("../models/User");
const Trip = require("../models/Trip");
const router = express.Router();
const protect = require("../middleware/protect");

router.post("/history", protect, async (req, res) => {
  const { tripDetails } = req.body;

  try {
    const addTrip = await Trip.create(tripDetails.map((trip) => ({
      user_id: req.user._id,
      place_of_visit: trip.place_of_visit,
      start_date: trip.start_date,
      end_date: trip.end_date,
      duration_of_visit: trip.duration_of_visit,
      overall_budget: trip.overall_budget,
    })));
    console.log("Trip added:", addTrip);
    const updateUser = await User.findByIdAndUpdate(addTrip.map(trip => trip.user_id), {
      $push: {
        placesVisited: addTrip.map(trip => trip.place_of_visit),
        recentlyVisited: addTrip[addTrip.length - 1]?.place_of_visit || null,
      },
    }, { new: true, runValidators: true });

    if (!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(addTrip);
  } catch (error) {
    console.error("Error updating trip history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;