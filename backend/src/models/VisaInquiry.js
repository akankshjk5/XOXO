const mongoose = require("mongoose");

const visaInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    destination: { type: String, required: true },
    travelDate: Date,
    message: String,
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisaInquiry", visaInquirySchema);
