const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    country: { type: String },
    expertise: [{ type: String }],
    hourlyRate: { type: Number },
    dailyRate: { type: Number },
    languages: [{ type: String }],
    description: { type: String },
    photos: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    availability: [
      {
        day: String,
        slots: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guide", guideSchema);
