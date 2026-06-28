const AnalyticsEvent = require("../models/AnalyticsEvent");
const Package = require("../models/Package");

/** POST /api/analytics/track */
exports.track = async (req, res, next) => {
  try {
    const { event, entityType, entityId, meta, sessionId, country, device } = req.body;
    if (!event) {
      return res.status(400).json({ success: false, message: "event is required" });
    }

    await AnalyticsEvent.create({
      event,
      entityType,
      entityId,
      meta,
      sessionId,
      country,
      device,
      userId: req.user?._id,
    });

    if (event === "view" && entityType === "package" && entityId) {
      await Package.findByIdAndUpdate(entityId, { $inc: { viewCount: 1 } });
    }
    if (event === "share" && entityType === "package" && entityId) {
      await Package.findByIdAndUpdate(entityId, { $inc: { shareCount: 1 } });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/** GET /api/analytics/summary (admin) */
exports.summary = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [byEvent, topPackages, topCountries] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            event: "view",
            entityType: "package",
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        { $group: { _id: "$entityId", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { country: { $exists: true, $ne: null }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const packageIds = topPackages.map((p) => p._id).filter(Boolean);
    const packages = await Package.find({ _id: { $in: packageIds } }).select("title").lean();
    const titleMap = Object.fromEntries(packages.map((p) => [String(p._id), p.title]));

    res.json({
      success: true,
      data: {
        byEvent: Object.fromEntries(byEvent.map((e) => [e._id, e.count])),
        topPackages: topPackages.map((p) => ({
          id: p._id,
          title: titleMap[String(p._id)] || "Package",
          views: p.views,
        })),
        topCountries,
      },
    });
  } catch (err) {
    next(err);
  }
};
