const Booking = require("../models/Booking");
const Package = require("../models/Package");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const { ADDON_PRICES } = require("../constants/addons");
const { findValidCoupon } = require("./coupon.controller");
const { normalizePhone, validatePhone } = require("../utils/phone");
const { DEFAULT_BOOKING_STATUS } = require("../constants/bookingStatus");
const { notifyBookingCreated } = require("../services/bookingNotificationService");
const logger = require("../config/logger");

const genRef = () =>
  "XOXO-" + Math.random().toString(36).slice(2, 7).toUpperCase() + Date.now().toString().slice(-4);

function calcAddOnTotal(addOns, numTravelers) {
  return addOns.reduce((sum, a) => {
    const price = ADDON_PRICES[a] || 0;
    const perTraveler = a === "insurance" || a === "visa";
    return sum + price * (perTraveler ? numTravelers : 1);
  }, 0);
}

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
      couponCode,
      contactEmail,
      contactPhone,
    } = req.body;

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const resolvedPhone = contactPhone || req.user.phone;
    if (!resolvedPhone || !validatePhone(resolvedPhone)) {
      return res.status(400).json({
        success: false,
        message: "A valid contact phone number is required to complete your booking enquiry.",
      });
    }

    const validAddOns = addOns.filter((a) => ADDON_PRICES[a] != null);
    const addOnTotal = calcAddOnTotal(validAddOns, numTravelers);
    const subtotal = pkg.pricePerPerson * numTravelers + addOnTotal;

    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const result = await findValidCoupon(couponCode, subtotal);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.error });
      }
      appliedCoupon = result.coupon;
      discountAmount = result.discount;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const persistedAddOns = validAddOns.map((a) => ({
      type: a,
      price: ADDON_PRICES[a] || 0,
      perTraveler: a === "insurance" || a === "visa",
    }));

    const contactName = travelers?.[0]?.name || req.user.name || "";

    const booking = await Booking.create({
      user: req.user._id,
      package: pkg._id,
      bookingType: "package",
      status: DEFAULT_BOOKING_STATUS,
      travelDate,
      returnDate,
      numTravelers,
      travelers,
      addOns: persistedAddOns,
      totalAmount,
      discountAmount,
      couponCode: appliedCoupon?.code,
      contactEmail: contactEmail || req.user.email,
      contactPhone: normalizePhone(resolvedPhone),
      contactName,
      specialRequests,
      bookingRef: genRef(),
    });

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
    }

    notifyBookingCreated(booking).catch((err) => {
      logger.warn("Booking notifications async error", { error: err.message, ref: booking.bookingRef });
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
    const booking = await Booking.findById(req.params.id).populate("package").populate("user", "name email phone");
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
    if (booking.paymentStatus === "paid" && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Paid bookings cannot be cancelled online. Please contact XOXO Travels support.",
      });
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
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { bookingRef: { $regex: search, $options: "i" } },
      ];
    }
    let items = await Booking.find(filter)
      .populate({
        path: "package",
        select: "title slug destination",
        populate: { path: "destination", select: "name country" },
      })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(q) ||
          b.user?.email?.toLowerCase().includes(q) ||
          b.user?.phone?.includes(q.replace(/\D/g, "")) ||
          b.package?.title?.toLowerCase().includes(q)
      );
    }
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

// PUT /api/bookings/:id/assign  (admin)
exports.assignConsultant = async (req, res, next) => {
  try {
    const { consultantName } = req.body;
    if (!consultantName?.trim()) {
      return res.status(400).json({ success: false, message: "Consultant name is required" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        assignedConsultant: consultantName.trim(),
        status: "consultant_assigned",
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
