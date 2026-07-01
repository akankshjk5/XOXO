const Message = require("../models/Message");
const User = require("../models/User");
const Guide = require("../models/Guide");
const ChatRoomGuide = require("../models/ChatRoomGuide");
const { notify } = require("../utils/notify");

const roomFor = (a, b) => [String(a), String(b)].sort().join("_");

async function activeGuidesForRoom(roomId) {
  return ChatRoomGuide.find({ roomId, active: true })
    .populate({
      path: "guideProfile",
      select: "city country languages rating isVerified isAvailable expertise",
      populate: { path: "user", select: "name avatar" },
    })
    .populate("guideUser", "name avatar")
    .lean();
}

// GET /api/chat/conversations
exports.conversations = async (req, res, next) => {
  try {
    const me = String(req.user._id);
    const msgs = await Message.find({ $or: [{ sender: me }, { receiver: me }] }).sort({ createdAt: -1 });

    const byPeer = new Map();
    for (const m of msgs) {
      const peer = String(m.sender) === me ? String(m.receiver) : String(m.sender);
      if (!byPeer.has(peer)) {
        byPeer.set(peer, {
          peerId: peer,
          roomId: m.roomId,
          lastMessage: m.content,
          lastAt: m.createdAt,
          unread: 0,
        });
      }
      if (String(m.receiver) === me && !m.isRead) byPeer.get(peer).unread += 1;
    }

    const peers = [...byPeer.keys()];
    const users = await User.find({ _id: { $in: peers } }).select("name avatar");
    const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

    const data = [...byPeer.values()].map((c) => ({ ...c, peer: userMap[c.peerId] || null }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:peerId  -> messages with a peer (marks incoming as read)
exports.thread = async (req, res, next) => {
  try {
    const room = roomFor(req.user._id, req.params.peerId);
    const messages = await Message.find({ roomId: room }).sort({ createdAt: 1 }).limit(200);
    await Message.updateMany(
      { roomId: room, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    const peer = await User.findById(req.params.peerId).select("name avatar");
    const guides = await activeGuidesForRoom(room);
    res.json({ success: true, data: { roomId: room, peer, messages, guides } });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat/:peerId  { content, type }  (REST fallback; socket is primary)
exports.send = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "Message is required" });
    const room = roomFor(req.user._id, req.params.peerId);

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.peerId,
      roomId: room,
      content,
      type: type || "text",
    });

    try {
      const io = req.app.get("io");
      if (io) io.to(room).emit("newMessage", message);
    } catch {
      /* socket optional */
    }
    await notify(req.app, {
      user: req.params.peerId,
      type: "message",
      title: `New message from ${req.user.name}`,
      body: content.slice(0, 60),
      link: `/chat?peer=${req.user._id}`,
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:peerId/guides
exports.listRoomGuides = async (req, res, next) => {
  try {
    const room = roomFor(req.user._id, req.params.peerId);
    const guides = await activeGuidesForRoom(room);
    res.json({ success: true, data: guides });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat/:peerId/guides  { guideId }
exports.inviteGuide = async (req, res, next) => {
  try {
    const { guideId } = req.body;
    if (!guideId) return res.status(400).json({ success: false, message: "guideId required" });
    const guide = await Guide.findById(guideId).populate("user", "name avatar");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    if (!guide.isVerified) {
      return res.status(400).json({ success: false, message: "Only verified guides can be invited" });
    }
    const room = roomFor(req.user._id, req.params.peerId);
    const existing = await ChatRoomGuide.findOne({
      roomId: room,
      guideUser: guide.user._id,
      active: true,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Guide already in conversation" });
    }
    const entry = await ChatRoomGuide.create({
      roomId: room,
      guideProfile: guide._id,
      guideUser: guide.user._id,
      invitedBy: req.user._id,
    });
    const guideName = guide.user?.name || "Local guide";
    const systemMsg = await Message.create({
      sender: req.user._id,
      receiver: req.params.peerId,
      roomId: room,
      content: `📍 Local guide ${guideName} joined the conversation`,
      type: "text",
    });
    try {
      const io = req.app.get("io");
      if (io) io.to(room).emit("newMessage", systemMsg);
    } catch {
      /* optional */
    }
    await notify(req.app, {
      user: guide.user._id,
      type: "message",
      title: `${req.user.name} invited you to a chat`,
      body: "Join the conversation as a local guide",
      link: `/chat?peer=${req.user._id}`,
    });
    const populated = await ChatRoomGuide.findById(entry._id)
      .populate({
        path: "guideProfile",
        select: "city country languages rating isVerified isAvailable",
        populate: { path: "user", select: "name avatar" },
      })
      .populate("guideUser", "name avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chat/:peerId/guides/:guideUserId
exports.removeGuide = async (req, res, next) => {
  try {
    const room = roomFor(req.user._id, req.params.peerId);
    const entry = await ChatRoomGuide.findOne({
      roomId: room,
      guideUser: req.params.guideUserId,
      active: true,
    });
    if (!entry) return res.status(404).json({ success: false, message: "Guide not in conversation" });
    entry.active = false;
    entry.leftAt = new Date();
    await entry.save();
    const guideUser = await User.findById(req.params.guideUserId).select("name");
    const systemMsg = await Message.create({
      sender: req.user._id,
      receiver: req.params.peerId,
      roomId: room,
      content: `📍 ${guideUser?.name || "Guide"} left the conversation`,
      type: "text",
    });
    try {
      const io = req.app.get("io");
      if (io) io.to(room).emit("newMessage", systemMsg);
    } catch {
      /* optional */
    }
    res.json({ success: true, data: systemMsg });
  } catch (err) {
    next(err);
  }
};

module.exports.roomFor = roomFor;
