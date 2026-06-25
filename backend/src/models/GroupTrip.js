const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["creator", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const groupTripSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    departureDate: { type: Date, required: true },
    returnDate: { type: Date },
    maxMembers: { type: Number, default: 10 },
    members: [memberSchema],
    description: { type: String },
    tripStyle: { type: String },
    costPerPerson: { type: Number },
    status: {
      type: String,
      enum: ["open", "full", "closed", "completed"],
      default: "open",
    },
    coverImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupTrip", groupTripSchema);
