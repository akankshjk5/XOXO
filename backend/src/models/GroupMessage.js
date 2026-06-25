const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema(
  {
    groupTrip: { type: mongoose.Schema.Types.ObjectId, ref: "GroupTrip", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image"], default: "text" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
