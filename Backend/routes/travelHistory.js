const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const TravelHistory = require('../models/History');
const protect = require('../middleware/protect');

const router = express.Router();

// @route   POST /api/travelhistory
// @desc    Add one or more past trips to user's travel history
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { trips } = req.body; // Expect an array of trip objects
  const userId = req.user._id;

  if (!Array.isArray(trips) || trips.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of trip objects.');
  }

  const newTravelHistoryEntries = trips.map(trip => ({
    userId,
    place_of_visit: trip.place_of_visit,
    start_date: trip.start_date || null,
    end_date: trip.end_date || null,
    duration_of_visit: trip.duration_of_visit || 0,
    overall_budget: trip.overall_budget || 0,
  }));

  await TravelHistory.insertMany(newTravelHistoryEntries);

  res.status(201).json({ message: 'Travel history added successfully.' });
}));

// @route   GET /api/travelhistory/:userId
// @desc    Get a user's past travel history
// @access  Private (should ideally be accessible only to the user themselves or admins)
router.get('/:userId', protect, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Ensure the logged-in user is requesting their own data
  if (req.user._id.toString() !== userId) {
    res.status(403);
    throw new Error('Not authorized to view this travel history.');
  }

  const travelHistory = await TravelHistory.find({ userId }).sort({ start_date: -1 });

  res.status(200).json({ travelHistory });
}));

module.exports = router;
