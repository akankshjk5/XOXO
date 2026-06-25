const Review = require("../models/Review");
const Package = require("../models/Package");

async function recalcPackageRating(packageId) {
  const reviews = await Review.find({ package: packageId });
  const reviewCount = reviews.length;
  const rating = reviewCount
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;
  await Package.findByIdAndUpdate(packageId, { rating, reviewCount });
}

// GET /api/reviews/package/:packageId
exports.getForPackage = async (req, res, next) => {
  try {
    const reviews = await Review.find({ package: req.params.packageId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews  { packageId, rating, title, comment }
exports.create = async (req, res, next) => {
  try {
    const { packageId, rating, title, comment, images = [] } = req.body;
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const existing = await Review.findOne({ package: packageId, user: req.user._id });
    let review;
    if (existing) {
      existing.rating = rating;
      existing.title = title;
      existing.comment = comment;
      existing.images = images;
      review = await existing.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        package: packageId,
        rating,
        title,
        comment,
        images,
      });
    }

    await recalcPackageRating(packageId);
    await review.populate("user", "name avatar");
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id
exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(review.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not your review" });
    }
    const packageId = review.package;
    await review.deleteOne();
    if (packageId) await recalcPackageRating(packageId);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
