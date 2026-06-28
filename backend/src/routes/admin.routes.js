const express = require("express");
const Destination = require("../models/Destination");
const { seedDatabase } = require("../services/seedDatabase");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const adminCtrl = require("../controllers/admin.controller");

const router = express.Router();

/**
 * POST /api/admin/seed
 * One-time production seed when ALLOW_DB_SEED=true on Railway.
 * Optional query: ?force=true to wipe destinations/packages first.
 */
router.post("/seed", async (req, res, next) => {
  try {
    if (process.env.ALLOW_DB_SEED !== "true") {
      return res.status(403).json({
        success: false,
        message: "Database seeding is disabled. Set ALLOW_DB_SEED=true on the server.",
      });
    }

    const force = req.query.force === "true";
    const stats = await seedDatabase({ force });

    res.json({
      success: true,
      message: "Database seeded",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/seed/status — counts only (no auth; safe read)
 */
router.get("/seed/status", async (req, res, next) => {
  try {
    const [destinations, packages] = await Promise.all([
      Destination.countDocuments(),
      require("../models/Package").countDocuments(),
    ]);
    res.json({
      success: true,
      data: { destinations, packages, seedingEnabled: process.env.ALLOW_DB_SEED === "true" },
    });
  } catch (err) {
    next(err);
  }
});

/** Protected admin routes */
router.use(protect, adminOnly);

router.get("/dashboard", adminCtrl.getDashboard);

module.exports = router;
