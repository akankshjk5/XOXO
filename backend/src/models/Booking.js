const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
    bookingType: {
      type: String,
      enum: ["package", "flight", "hotel", "activity", "guide", "transport"],
      default: "package",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    travelDate: { type: Date },
    returnDate: { type: Date },
    numTravelers: { type: Number, default: 1 },
    travelers: [
      {
        name: String,
        age: Number,
        passport: String,
      },
    ],
    totalAmount: { type: Number },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpayRefundId: { type: String },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    refundedAmount: { type: Number, default: 0 },
    invoiceUrl: { type: String },
    addOns: [
      {
        type: { type: String },
        price: Number,
        perTraveler: Boolean,
      },
    ],
    inventoryMeta: { type: mongoose.Schema.Types.Mixed },
    specialRequests: { type: String },
    bookingRef: { type: String, unique: true },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    contactEmail: { type: String },
    contactPhone: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ razorpayOrderId: 1 });
bookingSchema.index({ razorpayPaymentId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
