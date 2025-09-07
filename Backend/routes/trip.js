const express = require("express");
const User = require("../models/User");
const Trip = require("../models/Trip");
const router = express.Router();
const protect = require("../middleware/protect");
const asyncHandler = require("../utils/asyncHandler");

router.post(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const { tripDetails } = req.body;

    if (!Array.isArray(tripDetails) || tripDetails.length === 0) {
      res.status(400);
      throw new Error("tripDetails must be a non-empty array");
    }

    for (const trip of tripDetails) {
      if (!trip.place_of_visit || typeof trip.place_of_visit !== 'string') {
        res.status(400);
        throw new Error("Each trip must have a valid place_of_visit (string)");
      }
      if (!trip.start_date || typeof trip.start_date !== 'string' || !Date.parse(trip.start_date)) {
        res.status(400);
        throw new Error("Each trip must have a valid start_date (date string)");
      }
      if (!trip.end_date || typeof trip.end_date !== 'string' || !Date.parse(trip.end_date)) {
        res.status(400);
        throw new Error("Each trip must have a valid end_date (date string)");
      }
      if (typeof trip.duration_of_visit !== 'number' || trip.duration_of_visit <= 0) {
        res.status(400);
        throw new Error("Each trip must have a valid duration_of_visit (positive number)");
      }
      if (typeof trip.overall_budget !== 'number' || trip.overall_budget <= 0) {
        res.status(400);
        throw new Error("Each trip must have a valid overall_budget (positive number)");
      }
    }

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
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json(addTrip);
  })
);

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
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

    // Input validation for creating a new trip
    if (!place_of_visit || typeof place_of_visit !== 'string') {
      res.status(400);
      throw new Error('place_of_visit (string) is required.');
    }
    if (!start_date || typeof start_date !== 'string' || !Date.parse(start_date)) {
      res.status(400);
      throw new Error('start_date (date string) is required and must be valid.');
    }
    if (!end_date || typeof end_date !== 'string' || !Date.parse(end_date)) {
      res.status(400);
      throw new Error('end_date (date string) is required and must be valid.');
    }
    if (typeof duration_of_visit !== 'number' || duration_of_visit <= 0) {
      res.status(400);
      throw new Error('duration_of_visit (positive number) is required.');
    }
    if (typeof overall_budget !== 'number' || overall_budget <= 0) {
      res.status(400);
      throw new Error('overall_budget (positive number) is required.');
    }
    if (typeof total_spent !== 'number' || total_spent < 0) {
      res.status(400);
      throw new Error('total_spent (non-negative number) is required.');
    }
    // Optional array fields validation
    if (travel && !Array.isArray(travel)) {
      res.status(400);
      throw new Error('travel must be an array if provided.');
    }
    if (hotels && !Array.isArray(hotels)) {
      res.status(400);
      throw new Error('hotels must be an array if provided.');
    }
    if (activities && !Array.isArray(activities)) {
      res.status(400);
      throw new Error('activities must be an array if provided.');
    }

    const trip = await Trip.create({
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
  })
);

router.get(
  '/my-trips',
  protect,
  asyncHandler(async (req, res) => {
    const trips = await Trip.find({ user_id: req.user._id }).sort({ start_date: -1 });
    res.json({ success: true, trips });
  })
);

router.get(
  '/:tripId',
  protect,
  asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.tripId);
    console.log("Fetched trip:", trip);
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    if (trip.user_id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized: You do not have access to this trip');
    }

    res.json({ success: true, trip });
  })
);

module.exports = router;
