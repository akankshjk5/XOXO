const GroupTrip = require("../models/GroupTrip");
const GroupMessage = require("../models/GroupMessage");

/** GET /api/admin/groups */
exports.listGroups = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { destination: new RegExp(search, "i") },
      ];
    }
    const groups = await GroupTrip.find(filter)
      .populate("creator", "name email phone")
      .populate("members.user", "name email phone avatar")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/groups/:id */
exports.getGroup = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id)
      .populate("creator", "name email phone avatar")
      .populate("members.user", "name email phone avatar isVerified");
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/groups */
exports.createGroup = async (req, res, next) => {
  try {
    const {
      creatorId,
      title,
      destination,
      departureDate,
      returnDate,
      maxMembers,
      description,
      tripStyle,
      costPerPerson,
      coverImage,
      status,
    } = req.body;
    if (!title || !destination || !departureDate) {
      return res.status(400).json({ success: false, message: "title, destination, departureDate required" });
    }
    const creator = creatorId || req.user._id;
    const group = await GroupTrip.create({
      creator,
      title,
      destination,
      departureDate,
      returnDate,
      maxMembers: maxMembers || 10,
      description,
      tripStyle,
      costPerPerson,
      coverImage,
      status: status || "open",
      members: [{ user: creator, role: "creator" }],
    });
    const populated = await GroupTrip.findById(group._id)
      .populate("creator", "name email")
      .populate("members.user", "name email avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/groups/:id */
exports.updateGroup = async (req, res, next) => {
  try {
    const allowed = [
      "title",
      "destination",
      "departureDate",
      "returnDate",
      "maxMembers",
      "description",
      "tripStyle",
      "costPerPerson",
      "coverImage",
      "status",
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const group = await GroupTrip.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("creator", "name email phone")
      .populate("members.user", "name email phone avatar");
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/groups/:id/close */
exports.closeGroup = async (req, res, next) => {
  try {
    const group = await GroupTrip.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true }
    )
      .populate("creator", "name email")
      .populate("members.user", "name email avatar");
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/groups/:id */
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await GroupTrip.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    await GroupMessage.deleteMany({ groupTrip: group._id });
    res.json({ success: true, message: "Group deleted" });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/groups/:id/members/:userId */
exports.removeMember = async (req, res, next) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    if (String(group.creator) === String(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Cannot remove group creator" });
    }
    group.members = group.members.filter((m) => String(m.user) !== String(req.params.userId));
    if (group.status === "full") group.status = "open";
    await group.save();
    const populated = await GroupTrip.findById(group._id)
      .populate("creator", "name email phone")
      .populate("members.user", "name email phone avatar");
    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
