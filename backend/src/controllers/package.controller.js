const Package = require("../models/Package");
const Destination = require("../models/Destination");

// Map homepage traveler types to package categories
const TYPE_TO_CATEGORY = {
  couple: "honeymoon",
  family: "family",
  friends: "friends",
  solo: "solo",
};

const SORT_MAP = {
  price_asc: { pricePerPerson: 1 },
  price_desc: { pricePerPerson: -1 },
  rating: { rating: -1 },
  popular: { bookingCount: -1 },
  newest: { createdAt: -1 },
};

// GET /api/packages
exports.getAll = async (req, res, next) => {
  try {
    const {
      category,
      type,
      duration,
      minPrice,
      maxPrice,
      badge,
      search,
      sort = "popular",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    const resolvedCategory = category || (type && TYPE_TO_CATEGORY[type]) || type;
    if (resolvedCategory) filter.category = resolvedCategory;
    if (badge) filter.badge = badge;

    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice && Number(maxPrice) !== Infinity) filter.pricePerPerson.$lte = Number(maxPrice);
    }

    if (duration) {
      const ranges = { "3-5": [3, 5], "6-9": [6, 9], "10+": [10, 999] };
      const r = ranges[duration];
      if (r) filter.durationDays = { $gte: r[0], $lte: r[1] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortBy = SORT_MAP[sort] || SORT_MAP.popular;

    const [items, total] = await Promise.all([
      Package.find(filter)
        .populate("destination", "name slug country coverImage")
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Package.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/packages/trending
exports.getTrending = async (req, res, next) => {
  try {
    const items = await Package.find({ isActive: true })
      .populate("destination", "name slug country coverImage")
      .sort({ bookingCount: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/packages/visa-free
exports.getVisaFree = async (req, res, next) => {
  try {
    const items = await Package.find({ isActive: true, isVisaFree: true })
      .populate("destination")
      .limit(12);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/packages/recent-bookings  (social proof, anonymized)
exports.getRecentBookings = async (req, res, next) => {
  try {
    const items = await Package.find({ isActive: true })
      .populate("destination")
      .sort({ updatedAt: -1 })
      .limit(10);

    const names = ["Arjun", "Priya", "Rahul", "Aisha", "Vikram", "Sneha", "Karan", "Meera"];
    const cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Pune", "Hyderabad"];
    const data = items.map((p, i) => ({
      packageId: p._id,
      packageTitle: p.title,
      image: p.images?.[0] || "",
      userName: names[i % names.length],
      userCity: cities[i % cities.length],
      bookedAgo: `${(i % 12) + 1}hr ago`,
      price: p.pricePerPerson,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/packages/slug/:slug
exports.getBySlug = async (req, res, next) => {
  try {
    const pkg = await Package.findOne({ slug: req.params.slug }).populate("destination");
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

// GET /api/packages/:id
exports.getById = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id).populate("destination");
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    // Similar packages (same category, exclude self)
    const similar = await Package.find({
      _id: { $ne: pkg._id },
      category: pkg.category,
      isActive: true,
    })
      .populate("destination")
      .limit(4);

    res.json({ success: true, data: { ...pkg.toObject(), similar } });
  } catch (err) {
    next(err);
  }
};

// POST /api/packages  (admin)
exports.create = async (req, res, next) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

// PUT /api/packages/:id  (admin)
exports.update = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/packages/:id  (admin)
exports.remove = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
    res.json({ success: true, message: "Package deleted" });
  } catch (err) {
    next(err);
  }
};
