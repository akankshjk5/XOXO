const User = require("../models/User");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const SiteSettings = require("../models/SiteSettings");
const { phoneSearchPattern } = require("../utils/phone");

/** GET /api/admin/users */
exports.listUsers = async (req, res, next) => {
  try {
    const { search, role, blocked } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (blocked === "true") filter.isBlocked = true;
    if (blocked === "false") filter.isBlocked = false;
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
      .select("name email phone role isBlocked isVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const data = users.map((u) => ({ ...u, phoneNumber: u.phone || "" }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/users/:id */
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isBlocked } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (isBlocked !== undefined) update.isBlocked = isBlocked;
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("name email role isBlocked");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
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
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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

/** GET /api/admin/settings */
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne({ key: "main" });
    if (!settings) {
      settings = await SiteSettings.create({ key: "main" });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/settings */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

/** GET /api/settings — public read for footer/contact */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ key: "main" }).lean();
    res.json({
      success: true,
      data: settings || { websiteName: "XOXO Travels" },
    });
  } catch (err) {
    next(err);
  }
};
