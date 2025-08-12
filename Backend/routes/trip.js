const express = require("express");
const User = require("../models/User");
const Trip = require("../models/Trip");
const router = express.Router();
const protect = require("../middleware/protect");
const New = require('../models/New');

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
    const updateUser = await User.findByIdAndUpdate(req.user._id, {
      $push: {
        placesVisited: { $each: addTrip.map(trip => trip.place_of_visit) }
      },
      $set: {
        recentlyVisited: addTrip[addTrip.length - 1]?.place_of_visit || null,
      },
      $inc: {
        numberOfTrips: addTrip.length,
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

router.post('/', protect, async (req, res) => {
  try {
    const {
      place_of_visit,
      start_date,
      end_date,
      duration_of_visit,
      overall_budget,
      total_spent,
      travel,
      hotels,
      activities
    } = req.body;
    const trip = await New.create({
      user_id: req.user._id,
      place_of_visit,
      start_date,
      end_date,
      duration_of_visit,
      overall_budget,
      total_spent,
      travel,
      hotels,
      activities
    });

    res.status(201).json({ success: true, trip });
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ success: false, error: 'Failed to save trip' });
  }
});

router.get('/my-trips', protect, async (req, res) => {
  try {
    const trips = await New.find({ user_id: req.user._id }).sort({ start_date: -1 });
    res.json({ success: true, trips });
  } catch (err) {
    console.error("Error fetching user's trips:", err);
    res.status(500).json({ success: false, error: 'Failed to fetch trips' });
  }
});

router.get('/:tripId', protect, async (req, res) => {
  try {
    const trip = await New.findById(req.params.tripId);
    console.log("Fetched trip:", trip);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You do not have access to this trip' });
    }

    res.json({ success: true, trip });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to fetch trip details' });
  }
});

module.exports = router;
