const GroupTrip = require("../models/GroupTrip");
const GroupMessage = require("../models/GroupMessage");
const User = require("../models/User");
const { notify } = require("../utils/notify");

function roomId(groupId) {
  return `group_${groupId}`;
}

// GET /api/groups
exports.list = async (req, res, next) => {
  try {
    const { destination, status } = req.query;
    const filter = {};
    if (destination) filter.destination = new RegExp(destination, "i");
    if (status) filter.status = status;
    else filter.status = { $in: ["open", "full"] };

    const groups = await GroupTrip.find(filter)
      .populate("creator", "name avatar isVerified")
      .populate("members.user", "name avatar isVerified")
      .sort({ departureDate: 1 })
      .limit(50);
    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/my
exports.myGroups = async (req, res, next) => {
  try {
    const groups = await GroupTrip.find({
      $or: [{ creator: req.user._id }, { "members.user": req.user._id }],
    })
      .populate("creator", "name avatar")
      .populate("members.user", "name avatar")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id
exports.getById = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id)
      .populate("creator", "name avatar isVerified trustScore")
      .populate("members.user", "name avatar isVerified");
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups
exports.create = async (req, res, next) => {
  try {
    const {
      title,
      destination,
      departureDate,
      returnDate,
      maxMembers,
      description,
      tripStyle,
      costPerPerson,
      coverImage,
    } = req.body;
    if (!title || !destination || !departureDate) {
      return res.status(400).json({ success: false, message: "title, destination, departureDate required" });
    }

    const group = await GroupTrip.create({
      creator: req.user._id,
      title,
      destination,
      departureDate,
      returnDate,
      maxMembers: maxMembers || 10,
      description,
      tripStyle,
      costPerPerson,
      coverImage,
      members: [{ user: req.user._id, role: "creator" }],
    });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/join
exports.join = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    if (group.status === "closed" || group.status === "completed") {
      return res.status(400).json({ success: false, message: "Group is not accepting members" });
    }
    const already = group.members.some((m) => String(m.user) === String(req.user._id));
    if (already) return res.status(400).json({ success: false, message: "Already a member" });
    if (group.members.length >= group.maxMembers) {
      group.status = "full";
      await group.save();
      return res.status(400).json({ success: false, message: "Group is full" });
    }

    group.members.push({ user: req.user._id, role: "member" });
    if (group.members.length >= group.maxMembers) group.status = "full";
    await group.save();

    await notify(req.app, {
      user: group.creator,
      type: "social",
      title: "New group member",
      body: `${req.user.name} joined ${group.title}`,
      link: `/groups/${group._id}`,
    });

    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/leave
exports.leave = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Not found" });
    if (String(group.creator) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Creator cannot leave — transfer or close the group" });
    }
    group.members = group.members.filter((m) => String(m.user) !== String(req.user._id));
    if (group.status === "full") group.status = "open";
    await group.save();
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id/members/:userId  (creator removes member)
exports.removeMember = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Not found" });
    if (String(group.creator) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only creator can remove members" });
    }
    group.members = group.members.filter((m) => String(m.user) !== String(req.params.userId));
    if (group.status === "full") group.status = "open";
    await group.save();
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id/messages
exports.getMessages = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Not found" });
    const isMember =
      String(group.creator) === String(req.user._id) ||
      group.members.some((m) => String(m.user) === String(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: "Not a group member" });

    const messages = await GroupMessage.find({ groupTrip: group._id })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json({ success: true, data: { roomId: roomId(group._id), messages } });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/messages  { content }
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "content required" });

    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Not found" });
    const isMember =
      String(group.creator) === String(req.user._id) ||
      group.members.some((m) => String(m.user) === String(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: "Not a group member" });

    const message = await GroupMessage.create({
      groupTrip: group._id,
      sender: req.user._id,
      content,
    });
    await message.populate("sender", "name avatar");

    const rid = roomId(group._id);
    try {
      const io = req.app.get("io");
      if (io) io.to(rid).emit("groupMessage", message);
    } catch {
      /* optional */
    }

    // Notify other members
    for (const m of group.members) {
      if (String(m.user) !== String(req.user._id)) {
        await notify(req.app, {
          user: m.user,
          type: "message",
          title: `${group.title} — new message`,
          body: content.slice(0, 60),
          link: `/groups/${group._id}`,
        });
      }
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

module.exports.roomId = roomId;
