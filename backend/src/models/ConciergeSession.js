const mongoose = require("mongoose");
const crypto = require("crypto");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const intentSchema = new mongoose.Schema(
  {
    origin: { type: String, default: "DEL" },
    destination: String,
    budgetINR: Number,
    budgetLabel: String,
    departureDate: String,
    returnDate: String,
    durationDays: Number,
    travelers: { type: Number, default: 2 },
    tripType: String,
    travelStyle: [String],
    interests: [String],
    visaPreference: String,
    preferredAirlines: [String],
    hotelCategory: String,
    socialPreference: String,
    originCity: String,
    children: Number,
    seniors: Number,
    hasChildren: Boolean,
    hasSeniors: Boolean,
    luxuryLevel: String,
    adventureLevel: String,
    scope: String,
    flightPreference: String,
    foodPreferences: [String],
    pagePackageId: String,
    pagePackageTitle: String,
  },
  { _id: false }
);

const conciergeSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String, index: true },
    title: { type: String, default: "New trip" },
    status: {
      type: String,
      enum: ["gathering", "searching", "plan_ready", "archived"],
      default: "gathering",
    },
    messages: [messageSchema],
    intent: { type: intentSchema, default: () => ({}) },
    searchResults: { type: mongoose.Schema.Types.Mixed, default: {} },
    plan: { type: mongoose.Schema.Types.Mixed, default: null },
    missingFields: [{ type: String }],
    pageContext: { type: mongoose.Schema.Types.Mixed, default: null },
    shareToken: { type: String, unique: true, sparse: true },
    savedItineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },
  },
  { timestamps: true }
);

conciergeSessionSchema.pre("save", function generateShareToken(next) {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(12).toString("hex");
  }
  next();
});

module.exports = mongoose.model("ConciergeSession", conciergeSessionSchema);
