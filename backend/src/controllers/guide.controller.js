const Guide = require("../models/Guide");
const Booking = require("../models/Booking");
const { notify } = require("../utils/notify");

const genRef = () =>
  "GUIDE-" + Math.random().toString(36).slice(2, 7).toUpperCase() + Date.now().toString().slice(-4);

// GET /api/guides
exports.getAll = async (req, res, next) => {
  try {
    const { city, expertise, q, verified } = req.query;
    const filter = {};
    if (verified === "true") filter.isVerified = true;
    else filter.isAvailable = true;
    if (city) filter.city = new RegExp(city, "i");
    if (expertise) filter.expertise = expertise;
    if (q) filter.$or = [{ city: new RegExp(q, "i") }, { country: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];

    const guides = await Guide.find(filter)
      .populate("user", "name avatar nationality")
      .sort({ rating: -1, totalBookings: -1 });
    res.json({ success: true, data: guides });
  } catch (err) {
    next(err);
  }
};

// GET /api/guides/:id
exports.getById = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id).populate("user", "name avatar nationality bio");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    res.json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
};

// POST /api/guides  (become a guide)
exports.create = async (req, res, next) => {
  try {
    const existing = await Guide.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a guide profile" });
    }
    const { city, country, expertise, hourlyRate, dailyRate, languages, description, photos } = req.body;
    if (!city) return res.status(400).json({ success: false, message: "City is required" });

    const guide = await Guide.create({
      user: req.user._id,
      city,
      country,
      expertise,
      hourlyRate,
      dailyRate,
      languages,
      description,
      photos,
    });
    await require("../models/User").findByIdAndUpdate(req.user._id, { isGuide: true, role: "guide" });
    res.status(201).json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
};

// PUT /api/guides/me  (update own guide profile)
exports.updateMine = async (req, res, next) => {
  try {
    const allowed = ["city", "country", "expertise", "hourlyRate", "dailyRate", "languages", "description", "photos", "isAvailable", "availability"];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    const guide = await Guide.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    if (!guide) return res.status(404).json({ success: false, message: "No guide profile found" });
    res.json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
};

// POST /api/guides/:id/book  { date, days=1, hours, message }
exports.book = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id).populate("user", "_id name");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    if (String(guide.user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You can't book yourself" });
    }

    const { date, days = 1, hours, message } = req.body;
    const totalAmount = hours
      ? (guide.hourlyRate || 0) * Number(hours)
      : (guide.dailyRate || 0) * Number(days);

    const booking = await Booking.create({
      user: req.user._id,
      guide: guide._id,
      bookingType: "guide",
      travelDate: date,
      numTravelers: 1,
      totalAmount,
      specialRequests: message,
      bookingRef: genRef(),
    });

    guide.totalBookings += 1;
    await guide.save();

    await notify(req.app, {
      user: guide.user._id,
      type: "guide",
      title: "New guide booking request",
      body: `${req.user.name} requested your services.`,
      link: "/dashboard",
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports.genRef = genRef;
