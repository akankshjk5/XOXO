const TravelerMatch = require("../models/TravelerMatch");
const MatchRequest = require("../models/MatchRequest");
const User = require("../models/User");
const { computeMatchScore } = require("../utils/matchScore");
const { notify } = require("../utils/notify");

// GET /api/match/profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await TravelerMatch.findOne({ user: req.user._id });
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// PUT /api/match/profile
exports.upsertProfile = async (req, res, next) => {
  try {
    const {
      destination,
      travelDateFrom,
      travelDateTo,
      interests,
      travelStyle,
      lookingFor,
      budget,
      bio,
      isActive,
    } = req.body;
    if (!destination || !travelDateFrom || !travelDateTo) {
      return res.status(400).json({ success: false, message: "destination and travel dates are required" });
    }
    const profile = await TravelerMatch.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        destination,
        travelDateFrom,
        travelDateTo,
        interests: interests || [],
        travelStyle,
        lookingFor,
        budget,
        bio,
        isActive: isActive !== false,
      },
      { upsert: true, new: true, runValidators: true }
    );
    if (req.body.interests) {
      await User.findByIdAndUpdate(req.user._id, { interests: req.body.interests });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// GET /api/match/discover
exports.discover = async (req, res, next) => {
  try {
    const myProfile = await TravelerMatch.findOne({ user: req.user._id, isActive: true });
    if (!myProfile) {
      return res.json({
        success: true,
        data: [],
        requiresProfile: true,
        message: "Create your traveler profile first",
      });
    }

    const existing = await MatchRequest.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
      status: { $in: ["pending", "accepted"] },
    });
    const excludeIds = new Set([String(req.user._id)]);
    existing.forEach((r) => {
      excludeIds.add(String(r.fromUser));
      excludeIds.add(String(r.toUser));
    });

    const candidates = await TravelerMatch.find({
      user: { $nin: [...excludeIds] },
      isActive: true,
      destination: new RegExp(myProfile.destination.split(",")[0].trim(), "i"),
    })
      .populate("user", "name avatar isVerified trustScore bio interests nationality")
      .limit(50);

    const scored = candidates
      .map((c) => ({
        profile: c,
        matchScore: computeMatchScore(myProfile, c),
        user: c.user,
      }))
      .filter((x) => x.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: scored });
  } catch (err) {
    next(err);
  }
};

// POST /api/match/request  { toUserId, message }
exports.sendRequest = async (req, res, next) => {
  try {
    const { toUserId, message } = req.body;
    if (!toUserId) return res.status(400).json({ success: false, message: "toUserId required" });

    const myProfile = await TravelerMatch.findOne({ user: req.user._id });
    const theirProfile = await TravelerMatch.findOne({ user: toUserId });
    if (!myProfile || !theirProfile) {
      return res.status(400).json({ success: false, message: "Both users need active match profiles" });
    }

    const score = computeMatchScore(myProfile, theirProfile);
    let request;
    try {
      request = await MatchRequest.create({
        fromUser: req.user._id,
        toUser: toUserId,
        message,
        matchScore: score,
        status: "pending",
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(400).json({ success: false, message: "Request already sent" });
      }
      throw e;
    }

    await notify(req.app, {
      user: toUserId,
      type: "social",
      title: "New travel match request",
      body: `${req.user.name} wants to connect (${score}% match)`,
      link: "/match",
      meta: { requestId: request._id },
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// GET /api/match/requests
exports.getRequests = async (req, res, next) => {
  try {
    const incoming = await MatchRequest.find({ toUser: req.user._id, status: "pending" })
      .populate("fromUser", "name avatar isVerified trustScore bio")
      .sort({ createdAt: -1 });
    const outgoing = await MatchRequest.find({ fromUser: req.user._id })
      .populate("toUser", "name avatar isVerified trustScore bio")
      .sort({ createdAt: -1 });
    const accepted = await MatchRequest.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
      status: "accepted",
    })
      .populate("fromUser", "name avatar isVerified trustScore")
      .populate("toUser", "name avatar isVerified trustScore")
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: { incoming, outgoing, accepted } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/match/requests/:id/respond  { action: accept|reject }
exports.respond = async (req, res, next) => {
  try {
    const { action } = req.body;
    const request = await MatchRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (String(request.toUser) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not your request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already responded" });
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    await request.save();

    await notify(req.app, {
      user: request.fromUser,
      type: "social",
      title: action === "accept" ? "Match accepted! 🎉" : "Match request declined",
      body:
        action === "accept"
          ? `${req.user.name} accepted your travel match request`
          : `${req.user.name} declined your request`,
      link: "/match",
    });

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/match/requests/:id  (cancel outgoing pending)
exports.cancel = async (req, res, next) => {
  try {
    const request = await MatchRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Not found" });
    if (String(request.fromUser) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not your request" });
    }
    request.status = "cancelled";
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};
