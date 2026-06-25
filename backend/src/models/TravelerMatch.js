const mongoose = require("mongoose");

const travelerMatchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    destination: { type: String, required: true },
    travelDateFrom: { type: Date, required: true },
    travelDateTo: { type: Date, required: true },
    interests: [{ type: String }],
    travelStyle: { type: String },
    lookingFor: { type: String, enum: ["buddy", "group", "guide"], default: "buddy" },
    budget: { type: String, enum: ["budget", "mid-range", "luxury"], default: "mid-range" },
    bio: { type: String, maxlength: 300 },
    latitude: { type: Number },
    longitude: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

travelerMatchSchema.index({ destination: 1, isActive: 1 });
travelerMatchSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("TravelerMatch", travelerMatchSchema);
