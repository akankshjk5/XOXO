const User = require("../models/User");

// GET /api/users/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "destination", select: "name country slug" },
    });
    res.json({ success: true, data: user.wishlist || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/wishlist/:packageId  (toggle)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex((p) => String(p) === String(packageId));
    let added;
    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
      added = false;
    } else {
      user.wishlist.push(packageId);
      added = true;
    }
    await user.save();
    res.json({ success: true, added, data: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "phoneNumber", "avatar", "nationality", "bio", "travelStyle", "languages"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined && key !== "phoneNumber") {
        updates[key] = req.body[key];
      }
    }
    if (req.body.phoneNumber !== undefined && req.body.phone === undefined) {
      updates.phone = req.body.phoneNumber;
    }
    if (updates.phone !== undefined) {
      if (updates.phone && !validatePhone(updates.phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number (at least 10 digits required)",
        });
      }
      updates.phone = updates.phone ? normalizePhone(updates.phone) : undefined;
      if (updates.phone) {
        const taken = await User.findOne({
          phone: updates.phone,
          _id: { $ne: req.user._id },
        });
        if (taken) {
          return res.status(409).json({
            success: false,
            message: "Phone number already in use",
          });
        }
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    const json = user.toJSON();
    json.phoneNumber = json.phone || "";
    res.json({ success: true, data: json });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already in use",
      });
    }
    next(err);
  }
};
