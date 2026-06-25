const Itinerary = require("../models/Itinerary");

// POST /api/itineraries  (save a generated itinerary)
exports.create = async (req, res, next) => {
  try {
    const { destination, totalDays, tripType, budget, travelStyle, data } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: "destination required" });
    }
    const itinerary = await Itinerary.create({
      user: req.user._id,
      destination,
      totalDays,
      tripType,
      budget,
      travelStyle,
      data,
      estimatedBudget: data?.estimatedBudget,
      bestTimeToVisit: data?.bestTimeToVisit,
      packingTips: data?.packingTips || [],
      localTips: data?.localTips || [],
      isSaved: true,
    });
    res.status(201).json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
};

// GET /api/itineraries/my
exports.getMy = async (req, res, next) => {
  try {
    const items = await Itinerary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/itineraries/:id
exports.getById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ success: false, message: "Not found" });
    if (String(itinerary.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not yours" });
    }
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/itineraries/:id
exports.remove = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ success: false, message: "Not found" });
    if (String(itinerary.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not yours" });
    }
    await itinerary.deleteOne();
    res.json({ success: true, message: "Itinerary deleted" });
  } catch (err) {
    next(err);
  }
};
