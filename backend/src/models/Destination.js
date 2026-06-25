const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    slug: { type: String, unique: true },
    coverImage: { type: String },
    images: [{ type: String }],
    tagline: { type: String },
    description: { type: String },
    category: [{ type: String }],
    avgPriceINR: { type: Number },
    bestSeason: { type: String },
    visaRequired: { type: Boolean, default: true },
    isVisaFree: { type: Boolean, default: false },
    isAdventure: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    currency: { type: String },
    language: { type: String },
    timezone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema);
