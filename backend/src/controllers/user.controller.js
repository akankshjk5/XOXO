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
    const allowed = ["name", "phone", "avatar", "nationality", "bio", "travelStyle", "languages"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
