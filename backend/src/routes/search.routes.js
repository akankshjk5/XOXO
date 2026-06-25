const express = require("express");
const Package = require("../models/Package");
const Destination = require("../models/Destination");

const router = express.Router();

// GET /api/search?q=
router.get("/", async (req, res, next) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) return res.json({ success: true, data: { packages: [], destinations: [] } });

    const rx = { $regex: q, $options: "i" };
    const [packages, destinations] = await Promise.all([
      Package.find({ isActive: true, $or: [{ title: rx }, { description: rx }] })
        .populate("destination")
        .limit(6),
      Destination.find({ $or: [{ name: rx }, { country: rx }] }).limit(6),
    ]);

    res.json({ success: true, data: { packages, destinations } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
