const Booking = require("../models/Booking");
const User = require("../models/User");
const Review = require("../models/Review");
const Package = require("../models/Package");
const Destination = require("../models/Destination");
const Notification = require("../models/Notification");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** GET /api/admin/dashboard */
exports.getDashboard = async (req, res, next) => {
  try {
    const today = startOfToday();
    const monthStart = startOfMonth();

    const [
      todayBookings,
      todayRevenueAgg,
      activeUsers,
      pendingPayments,
      cancelledTrips,
      newReviews,
      recentBookings,
      recentUsers,
      recentPayments,
      recentNotifications,
      monthlyBookings,
      monthlyRevenue,
      topPackages,
      topDestinations,
    ] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: today }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Booking.countDocuments({ paymentStatus: { $in: ["unpaid", "partial"] } }),
      Booking.countDocuments({ status: "cancelled", updatedAt: { $gte: today } }),
      Review.countDocuments({ createdAt: { $gte: today } }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "name email")
        .populate("package", "title slug")
        .lean(),
      User.find().sort({ createdAt: -1 }).limit(6).select("name email role createdAt").lean(),
      Booking.find({ paymentStatus: "paid" })
        .sort({ updatedAt: -1 })
        .limit(6)
        .populate("user", "name")
        .select("totalAmount paidAmount paymentStatus updatedAt user")
        .lean(),
      Notification.find().sort({ createdAt: -1 }).limit(6).lean(),
      Booking.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: monthStart }, paymentStatus: "paid" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$paidAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { package: { $ne: null } } },
        { $group: { _id: "$package", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Destination.find().sort({ name: 1 }).limit(5).select("name slug country").lean(),
    ]);

    const packageIds = topPackages.map((p) => p._id).filter(Boolean);
    const packageDocs = await Package.find({ _id: { $in: packageIds } })
      .select("title slug")
      .lean();
    const pkgMap = Object.fromEntries(packageDocs.map((p) => [String(p._id), p]));

    res.json({
      success: true,
      data: {
        stats: {
          todayBookings,
          todayRevenue: todayRevenueAgg[0]?.total || 0,
          activeUsers,
          pendingPayments,
          cancelledTrips,
          newReviews,
        },
        charts: {
          monthlyBookings,
          monthlyRevenue,
          topPackages: topPackages.map((p) => ({
            id: p._id,
            title: pkgMap[String(p._id)]?.title || "Package",
            count: p.count,
          })),
          topDestinations,
        },
        activity: {
          recentBookings,
          recentUsers,
          recentPayments,
          recentNotifications,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
