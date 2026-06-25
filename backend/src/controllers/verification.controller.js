const VerificationRequest = require("../models/VerificationRequest");
const User = require("../models/User");
const { notify } = require("../utils/notify");

// GET /api/verification/status
exports.status = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("isVerified verificationStatus trustScore");
    const latest = await VerificationRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { user, latestRequest: latest } });
  } catch (err) {
    next(err);
  }
};

// POST /api/verification/submit  { documentUrl, idType }
exports.submit = async (req, res, next) => {
  try {
    const { documentUrl, idType } = req.body;
    if (!documentUrl) return res.status(400).json({ success: false, message: "documentUrl required" });

    const user = await User.findById(req.user._id);
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Already verified" });
    }
    if (user.verificationStatus === "pending") {
      return res.status(400).json({ success: false, message: "Verification already pending review" });
    }

    const request = await VerificationRequest.create({
      user: req.user._id,
      documentUrl,
      idType: idType || "passport",
      status: "pending",
    });

    user.verificationStatus = "pending";
    await user.save();

    res.status(201).json({
      success: true,
      data: request,
      message: "Submitted for review. Our team will verify within 24–48 hours.",
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/verification/:id/review  { action: approve|reject, adminNote }  (admin)
exports.review = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Not found" });

    const approved = action === "approve";
    request.status = approved ? "approved" : "rejected";
    request.adminNote = adminNote;
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    await request.save();

    const user = await User.findById(request.user);
    if (approved) {
      user.isVerified = true;
      user.verificationStatus = "approved";
      user.trustScore = Math.min(100, (user.trustScore || 50) + 30);
    } else {
      user.verificationStatus = "rejected";
    }
    await user.save();

    await notify(req.app, {
      user: user._id,
      type: "system",
      title: approved ? "You're verified! ✅" : "Verification declined",
      body: approved
        ? "Your identity has been verified. You now have the Trusted Traveller badge."
        : adminNote || "Please resubmit with a clearer document.",
      link: "/verify",
    });

    res.json({ success: true, data: { request, user } });
  } catch (err) {
    next(err);
  }
};

// GET /api/verification/pending  (admin)
exports.pending = async (req, res, next) => {
  try {
    const items = await VerificationRequest.find({ status: "pending" })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};
