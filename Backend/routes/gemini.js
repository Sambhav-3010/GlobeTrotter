const express = require('express');
const router = express.Router();
const { generateItinerary } = require('../controllers/geminiController');

// Define the route for generating an itinerary
router.post('/generate-itinerary', generateItinerary);

module.exports = router;