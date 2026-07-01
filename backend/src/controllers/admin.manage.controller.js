const User = require("../models/User");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const Booking = require("../models/Booking");
const Package = require("../models/Package");
const Destination = require("../models/Destination");
const SiteSettings = require("../models/SiteSettings");
const { phoneSearchPattern } = require("../utils/phone");

/** GET /api/admin/users */
exports.listUsers = async (req, res, next) => {
  try {
    const { search, role, blocked, verified } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (blocked === "true") filter.isBlocked = true;
    if (blocked === "false") filter.isBlocked = false;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;
    if (search) {
      const phoneDigits = phoneSearchPattern(search);
      const or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      if (phoneDigits) {
        or.push({ phone: { $regex: phoneDigits } });
      }
      filter.$or = or;
    }
    const users = await User.find(filter)
      .select("name email phone role isBlocked isVerified createdAt lastLoginAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const data = users.map((u) => ({ ...u, phoneNumber: u.phone || "" }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/users/:id */
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "name email phone role isBlocked isVerified createdAt lastLoginAt avatar trustScore wishlist destinationWishlist"
      )
      .populate("wishlist", "title pricePerPerson images")
      .populate("destinationWishlist", "name slug country coverImage")
      .lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const bookings = await Booking.find({ user: req.params.id })
      .populate("package", "title destination")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const paidBookings = bookings.filter((b) => b.paymentStatus === "paid");
    const totalSpending = paidBookings.reduce(
      (sum, b) => sum + (b.paidAmount || b.totalAmount || 0),
      0
    );

    res.json({
      success: true,
      data: {
        user: { ...user, phoneNumber: user.phone || "" },
        bookings,
        wishlist: user.wishlist || [],
        destinationWishlist: user.destinationWishlist || [],
        totalSpending,
        bookingCount: bookings.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/users/:id */
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isBlocked, isVerified } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (isBlocked !== undefined) update.isBlocked = isBlocked;
    if (isVerified !== undefined) update.isVerified = isVerified;
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("name email phone role isBlocked isVerified createdAt lastLoginAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const json = user.toJSON ? user.toJSON() : user;
    json.phoneNumber = json.phone || "";
    res.json({ success: true, data: json });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/users/:id */
exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin accounts" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/reviews */
exports.listReviews = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("package", "title")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    let data = reviews;
    if (search) {
      const q = String(search).toLowerCase();
      data = reviews.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          r.user?.name?.toLowerCase().includes(q) ||
          r.package?.title?.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/reviews/:id */
exports.moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/reviews/:id */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/coupons */
exports.listCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/coupons */
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/coupons/:id */
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/coupons/:id */
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

/** GET /api/settings — public site metadata (no auth) */
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne().lean();
    if (!settings) settings = {};
    res.json({
      success: true,
      data: {
        websiteName: settings.websiteName || "XOXO Travels",
        logo: settings.logo || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
        socialFacebook: settings.socialFacebook || "",
        socialInstagram: settings.socialInstagram || "",
        socialTwitter: settings.socialTwitter || "",
        socialLinkedin: settings.socialLinkedin || "",
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/settings */
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/settings */
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create(req.body);
    else Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};
