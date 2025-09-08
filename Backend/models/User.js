const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    f_name: {
      type: String,
      required: true,
      trim: true,
    },
    l_name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      trim: true,
    },
    password: {
      type: String,
      required: function() { return !this.googleId; }, // Required if not a Google-authenticated user
    },
    numberOfTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    recentlyVisited: {
      type: String,
      trim: true,
    },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
