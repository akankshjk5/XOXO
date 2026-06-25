const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    destination: { type: String, required: true },
    totalDays: { type: Number },
    tripType: { type: String },
    budget: { type: String },
    travelStyle: { type: String },
    estimatedBudget: { type: String },
    bestTimeToVisit: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    packingTips: [{ type: String }],
    localTips: [{ type: String }],
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Itinerary", itinerarySchema);
