const mongoose = require('mongoose');

const travelHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  place_of_visit: {
    type: String,
    required: true,
    trim: true,
  },
  start_date: {
    type: Date,
    required: false, // Can be optional if user doesn't provide it
  },
  end_date: {
    type: Date,
    required: false, // Can be optional if user doesn't provide it
  },
  duration_of_visit: {
    type: Number,
    required: false,
    min: 0,
  },
  overall_budget: {
    type: Number,
    required: false,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('TravelHistory', travelHistorySchema);
