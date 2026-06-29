const mongoose = require("mongoose");

const CORPORATE_TRAVEL_TYPES = [
  "conference",
  "business-event",
  "incentive-travel",
  "team-outing",
  "workation",
  "corporate-retreat",
  "mice-travel",
];

const corporateDetailsSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    employeeCountMin: { type: Number, min: 1 },
    employeeCountMax: { type: Number },
    meetingLocation: { type: String, trim: true },
    travelTypes: [{ type: String, enum: CORPORATE_TRAVEL_TYPES }],
    supportsInvoice: { type: Boolean, default: true },
    supportsGst: { type: Boolean, default: true },
    dedicatedTravelManager: { type: Boolean, default: false },
    customPricing: { type: Boolean, default: false },
    negotiatedHotels: { type: Boolean, default: false },
    airportTransfers: { type: Boolean, default: true },
  },
  { _id: false }
);

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
      enum: ["honeymoon", "family", "friends", "solo", "adventure", "luxury", "corporate"],
    },
    corporate: corporateDetailsSchema,
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
