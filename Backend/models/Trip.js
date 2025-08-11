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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
