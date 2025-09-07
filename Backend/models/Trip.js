const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place_of_visit: {
        type: String,
        required: true,
        trim: true
    },
    duration_of_visit: {
        type: Number,
        required: true,
        min: 1
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    overall_budget: {
        type: Number,
        required: true,
        min: 0
    },
    total_spent: {
        type: Number,
        default: 0
    },
    travel: {
        type: [Object],
        default: []
    },
    hotels: {
        type: [Object],
        default: []
    },
    activities: {
        type: [Object],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.New || mongoose.model('New', tripSchema);