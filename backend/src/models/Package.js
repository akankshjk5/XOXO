const mongoose = require("mongoose");

const itineraryDaySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    description: String,
    activities: [String],
    meals: [String],
    accommodation: String,
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
    description: { type: String },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number },
    pricePerPerson: { type: Number, required: true },
    originalPrice: { type: Number },
    maxPeople: { type: Number },
    minPeople: { type: Number, default: 1 },
    category: {
      type: String,
      enum: ["honeymoon", "family", "friends", "solo", "adventure", "luxury"],
    },
    badge: { type: String, enum: ["hot", "new", "deal", ""], default: "" },
    images: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: [itineraryDaySchema],
    highlights: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    visaRequired: { type: Boolean, default: true },
    isVisaFree: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    isLuxury: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
