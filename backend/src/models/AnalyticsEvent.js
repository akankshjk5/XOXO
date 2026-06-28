const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: ["view", "click", "wishlist", "share", "booking", "newsletter", "contact"],
    },
    entityType: { type: String, enum: ["package", "destination", "page", "flight", "hotel", "other"] },
    entityId: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    country: { type: String },
    device: { type: String },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
