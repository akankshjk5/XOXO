const Booking = require("../models/Booking");
const Package = require("../models/Package");
const User = require("../models/User");

const genRef = () =>
  "XOXO-" + Math.random().toString(36).slice(2, 7).toUpperCase() + Date.now().toString().slice(-4);

// POST /api/bookings
exports.create = async (req, res, next) => {
  try {
    const {
      packageId,
      travelDate,
      returnDate,
      numTravelers = 1,
      travelers = [],
      addOns = [],
      specialRequests,
    } = req.body;

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const ADDON_PRICES = { insurance: 1500, visa: 2500 };
    const addOnTotal = addOns.reduce((sum, a) => sum + (ADDON_PRICES[a] || 0), 0) * numTravelers;
    const totalAmount = pkg.pricePerPerson * numTravelers + addOnTotal;
    const persistedAddOns = addOns.map((a) => ({
      type: a,
      price: ADDON_PRICES[a] || 0,
      perTraveler: true,
    }));

    const booking = await Booking.create({
      user: req.user._id,
      package: pkg._id,
      bookingType: "package",
      travelDate,
      returnDate,
      numTravelers,
      travelers,
      addOns: persistedAddOns,
      totalAmount,
      specialRequests,
      bookingRef: genRef(),
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/transport — unified transport offer booking
exports.createTransport = async (req, res, next) => {
  try {
    const {
      offer,
      travelDate,
      returnDate,
      numTravelers = 1,
      travelers = [],
      specialRequests,
    } = req.body;

    if (!offer?.id || !offer?.mode || offer.price == null) {
      return res.status(400).json({
        success: false,
        message: "offer (id, mode, price) is required",
      });
    }

    const totalAmount = Number(offer.price);

    const booking = await Booking.create({
      user: req.user._id,
      bookingType: "transport",
      travelDate: travelDate || offer.departureAt,
      returnDate,
      numTravelers,
      travelers,
      totalAmount,
      inventoryMeta: {
        offer,
        hub: "transport",
        bookedAt: new Date().toISOString(),
      },
      specialRequests,
      bookingRef: genRef(),
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
exports.getMy = async (req, res, next) => {
  try {
    const items = await Booking.find({ user: req.user._id })
      .populate("package")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
exports.getById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("package").populate("user", "name email");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.user._id || booking.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not your booking" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/cancel
exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not your booking" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings  (admin)
exports.getAll = async (req, res, next) => {
  try {
    const items = await Booking.find().populate("package").populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/status  (admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
