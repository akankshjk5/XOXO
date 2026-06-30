const Guide = require("../models/Guide");
const User = require("../models/User");

/** GET /api/admin/guides */
exports.listGuides = async (req, res, next) => {
  try {
    const { search, city, verified } = req.query;
    const filter = {};
    if (city) filter.city = new RegExp(city, "i");
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;
    if (search) {
      filter.$or = [
        { city: new RegExp(search, "i") },
        { country: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }
    const guides = await Guide.find(filter)
      .populate("user", "name email avatar phone")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: guides });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/guides/:id */
exports.getGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id).populate("user", "name email avatar phone");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    res.json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/guides */
exports.createGuide = async (req, res, next) => {
  try {
    const { userId, city, country, expertise, hourlyRate, dailyRate, languages, description, photos, isVerified, isAvailable } =
      req.body;
    if (!userId || !city) {
      return res.status(400).json({ success: false, message: "userId and city are required" });
    }
    const existing = await Guide.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already has a guide profile" });
    }
    const guide = await Guide.create({
      user: userId,
      city,
      country,
      expertise,
      hourlyRate,
      dailyRate,
      languages,
      description,
      photos,
      isVerified: !!isVerified,
      isAvailable: isAvailable !== false,
    });
    await User.findByIdAndUpdate(userId, { isGuide: true, role: "guide" });
    const populated = await Guide.findById(guide._id).populate("user", "name email avatar phone");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/guides/:id */
exports.updateGuide = async (req, res, next) => {
  try {
    const allowed = [
      "city",
      "country",
      "expertise",
      "hourlyRate",
      "dailyRate",
      "languages",
      "description",
      "photos",
      "isVerified",
      "isAvailable",
      "availability",
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const guide = await Guide.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email avatar phone");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    res.json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/guides/:id */
exports.deleteGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    await Guide.findByIdAndDelete(req.params.id);
    const other = await Guide.findOne({ user: guide.user });
    if (!other) {
      await User.findByIdAndUpdate(guide.user, { isGuide: false, role: "user" });
    }
    res.json({ success: true, message: "Guide deleted" });
  } catch (err) {
    next(err);
  }
};
