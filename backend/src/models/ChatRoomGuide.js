const mongoose = require("mongoose");

const chatRoomGuideSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    guideProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
    guideUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
  },
  { timestamps: true }
);

chatRoomGuideSchema.index({ roomId: 1, guideUser: 1, active: 1 });

module.exports = mongoose.model("ChatRoomGuide", chatRoomGuideSchema);
