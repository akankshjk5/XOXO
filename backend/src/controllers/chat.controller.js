const Message = require("../models/Message");
const User = require("../models/User");
const { notify } = require("../utils/notify");

const roomFor = (a, b) => [String(a), String(b)].sort().join("_");

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
    res.json({ success: true, data: { roomId: room, peer, messages } });
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

module.exports.roomFor = roomFor;
