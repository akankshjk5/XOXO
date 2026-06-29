const Destination = require("../models/Destination");
const Package = require("../models/Package");

// GET /api/destinations
exports.getAll = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }
    const items = await Destination.find(filter).sort({ isTrending: -1, name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/trending
exports.getTrending = async (req, res, next) => {
  try {
    const items = await Destination.find({ isTrending: true });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/adventure
exports.getAdventure = async (req, res, next) => {
  try {
    const items = await Destination.find({ isAdventure: true });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/visa-free
exports.getVisaFree = async (req, res, next) => {
  try {
    const items = await Destination.find({ isVisaFree: true });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/search?q=
exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const items = await Destination.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    }).limit(10);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/autocomplete?q=
exports.autocomplete = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const items = await Destination.find({
      name: { $regex: `^${q}`, $options: "i" },
    })
      .select("name country slug")
      .limit(8);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/slug/:slug
exports.getBySlug = async (req, res, next) => {
  try {
    const raw = req.params.slug || "";
    // Try exact slug, then fall back to a name match (homepage uses friendly slugs)
    const namePart = raw.split("-")[0];
    let dest = await Destination.findOne({ slug: raw });
    if (!dest) {
      dest = await Destination.findOne({ name: { $regex: `^${namePart}$`, $options: "i" } });
    }
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
    const packages = await Package.find({ destination: dest._id, isActive: true }).limit(12);
    res.json({ success: true, data: { ...dest.toObject(), packages } });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/:id
exports.getById = async (req, res, next) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
    const packages = await Package.find({ destination: dest._id, isActive: true }).limit(12);
    res.json({ success: true, data: { ...dest.toObject(), packages } });
  } catch (err) {
    next(err);
  }
};

// POST /api/destinations  (admin)
exports.create = async (req, res, next) => {
  try {
    const dest = await Destination.create(req.body);
    res.status(201).json({ success: true, data: dest });
  } catch (err) {
    next(err);
  }
};

// PUT /api/destinations/:id  (admin)
exports.update = async (req, res, next) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
    res.json({ success: true, data: dest });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/destinations/:id  (admin)
exports.remove = async (req, res, next) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
    res.json({ success: true, message: "Destination deleted" });
  } catch (err) {
    next(err);
  }
};
