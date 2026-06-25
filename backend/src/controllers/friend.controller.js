const Friendship = require("../models/Friendship");
const User = require("../models/User");
const { notify } = require("../utils/notify");

// GET /api/friends/status/:userId
exports.getStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (String(userId) === String(req.user._id)) {
      return res.json({ success: true, data: { status: "self" } });
    }
    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id },
      ],
    });
    if (!friendship) {
      return res.json({ success: true, data: { status: "none" } });
    }
    if (friendship.status === "accepted") {
      return res.json({
        success: true,
        data: { status: "friends", friendshipId: friendship._id },
      });
    }
    if (friendship.status === "pending") {
      const sent = String(friendship.requester) === String(req.user._id);
      return res.json({
        success: true,
        data: {
          status: sent ? "pending_sent" : "pending_received",
          friendshipId: friendship._id,
        },
      });
    }
    return res.json({ success: true, data: { status: "none" } });
  } catch (err) {
    next(err);
  }
};

// GET /api/friends/status?ids=id1,id2
exports.getStatuses = async (req, res, next) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const result = {};
    if (!ids.length) return res.json({ success: true, data: result });

    const friendships = await Friendship.find({
      $or: [
        { requester: req.user._id, recipient: { $in: ids } },
        { requester: { $in: ids }, recipient: req.user._id },
      ],
    });

    ids.forEach((id) => {
      result[id] = { status: "none" };
    });

    friendships.forEach((f) => {
      const peer =
        String(f.requester) === String(req.user._id) ? String(f.recipient) : String(f.requester);
      if (!result[peer]) return;
      if (f.status === "accepted") {
        result[peer] = { status: "friends", friendshipId: f._id };
      } else if (f.status === "pending") {
        const sent = String(f.requester) === String(req.user._id);
        result[peer] = {
          status: sent ? "pending_sent" : "pending_received",
          friendshipId: f._id,
        };
      }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/friends
exports.listFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user._id, status: "accepted" },
        { recipient: req.user._id, status: "accepted" },
      ],
    })
      .populate("requester", "name avatar isVerified trustScore")
      .populate("recipient", "name avatar isVerified trustScore");

    const friends = friendships.map((f) => {
      const peer =
        String(f.requester._id) === String(req.user._id) ? f.recipient : f.requester;
      return { friendshipId: f._id, user: peer, since: f.updatedAt };
    });
    res.json({ success: true, data: friends });
  } catch (err) {
    next(err);
  }
};

// GET /api/friends/requests
exports.listRequests = async (req, res, next) => {
  try {
    const incoming = await Friendship.find({ recipient: req.user._id, status: "pending" })
      .populate("requester", "name avatar isVerified trustScore bio")
      .sort({ createdAt: -1 });
    const outgoing = await Friendship.find({ requester: req.user._id, status: "pending" })
      .populate("recipient", "name avatar isVerified trustScore bio")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { incoming, outgoing } });
  } catch (err) {
    next(err);
  }
};

// POST /api/friends/request  { userId }
exports.sendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "userId required" });
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Cannot friend yourself" });
    }
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id },
      ],
    });
    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ success: false, message: "Already friends" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ success: false, message: "Request already pending" });
      }
      // Re-open rejected
      existing.status = "pending";
      existing.requester = req.user._id;
      existing.recipient = userId;
      await existing.save();
      await notify(req.app, {
        user: userId,
        type: "social",
        title: "New friend request",
        body: `${req.user.name} sent you a friend request`,
        link: "/friends",
      });
      return res.json({ success: true, data: existing });
    }

    const friendship = await Friendship.create({
      requester: req.user._id,
      recipient: userId,
      status: "pending",
    });

    await notify(req.app, {
      user: userId,
      type: "social",
      title: "New friend request",
      body: `${req.user.name} sent you a friend request`,
      link: "/friends",
    });

    res.status(201).json({ success: true, data: friendship });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Request already exists" });
    }
    next(err);
  }
};

// PUT /api/friends/:id/respond  { action: accept|reject }
exports.respond = async (req, res, next) => {
  try {
    const { action } = req.body;
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ success: false, message: "Not found" });
    if (String(friendship.recipient) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not your request" });
    }
    if (friendship.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already responded" });
    }

    friendship.status = action === "accept" ? "accepted" : "rejected";
    await friendship.save();

    if (action === "accept") {
      await notify(req.app, {
        user: friendship.requester,
        type: "social",
        title: "Friend request accepted",
        body: `${req.user.name} accepted your friend request`,
        link: "/friends",
      });
    }

    res.json({ success: true, data: friendship });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/friends/:id  (remove friend or cancel outgoing)
exports.remove = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ success: false, message: "Not found" });
    const isParty =
      String(friendship.requester) === String(req.user._id) ||
      String(friendship.recipient) === String(req.user._id);
    if (!isParty) return res.status(403).json({ success: false, message: "Not your friendship" });
    await friendship.deleteOne();
    res.json({ success: true, message: "Removed" });
  } catch (err) {
    next(err);
  }
};
