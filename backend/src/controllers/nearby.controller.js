const User = require("../models/User");
const TravelerMatch = require("../models/TravelerMatch");
const { haversineKm } = require("../utils/matchScore");

// PUT /api/nearby/location  { latitude, longitude }
exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: "latitude and longitude required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { lastLatitude: latitude, lastLongitude: longitude, lastLocationAt: new Date() },
      { new: true }
    );
    await TravelerMatch.findOneAndUpdate(
      { user: req.user._id },
      { latitude, longitude },
      { upsert: false }
    );
    res.json({ success: true, data: { lastLatitude: user.lastLatitude, lastLongitude: user.lastLongitude } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/nearby/privacy  { locationVisible }
exports.setPrivacy = async (req, res, next) => {
  try {
    const { locationVisible } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { locationVisible: !!locationVisible },
      { new: true }
    );
    res.json({ success: true, data: { locationVisible: user.locationVisible } });
  } catch (err) {
    next(err);
  }
};

// GET /api/nearby?lat=&lng=&radiusKm=50&verifiedOnly=false
exports.discover = async (req, res, next) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radiusKm) || 50;
    const verifiedOnly = req.query.verifiedOnly === "true";

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      const me = await User.findById(req.user._id).select("lastLatitude lastLongitude");
      lat = me?.lastLatitude;
      lng = me?.lastLongitude;
    }

    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.json({
        success: true,
        data: [],
        requiresLocation: true,
        message: "Share your location to discover nearby travelers",
      });
    }

    const filter = {
      _id: { $ne: req.user._id },
      locationVisible: true,
      lastLatitude: { $ne: null },
      lastLongitude: { $ne: null },
    };
    if (verifiedOnly) filter.isVerified = true;

    const users = await User.find(filter).select(
      "name avatar isVerified trustScore bio interests nationality lastLatitude lastLongitude lastLocationAt"
    );

    const nearby = users
      .map((u) => {
        const distanceKm = haversineKm(lat, lng, u.lastLatitude, u.lastLongitude);
        return { user: u, distanceKm: Math.round(distanceKm * 10) / 10 };
      })
      .filter((x) => x.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ success: true, data: nearby, meta: { radiusKm, count: nearby.length } });
  } catch (err) {
    next(err);
  }
};

// GET /api/nearby/me
exports.getMySettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "locationVisible lastLatitude lastLongitude lastLocationAt isVerified trustScore"
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
