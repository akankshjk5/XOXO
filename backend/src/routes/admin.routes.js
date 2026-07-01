const express = require("express");
const Destination = require("../models/Destination");
const { seedDatabase } = require("../services/seedDatabase");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const adminCtrl = require("../controllers/admin.controller");
const manageCtrl = require("../controllers/admin.manage.controller");
const guidesCtrl = require("../controllers/admin.guides.controller");
const groupsCtrl = require("../controllers/admin.groups.controller");

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

router.get("/users", manageCtrl.listUsers);
router.get("/users/:id", manageCtrl.getUserDetail);
router.patch("/users/:id", manageCtrl.updateUser);
router.delete("/users/:id", manageCtrl.deleteUser);

router.get("/guides", guidesCtrl.listGuides);
router.get("/guides/:id", guidesCtrl.getGuide);
router.post("/guides", guidesCtrl.createGuide);
router.put("/guides/:id", guidesCtrl.updateGuide);
router.delete("/guides/:id", guidesCtrl.deleteGuide);

router.get("/groups", groupsCtrl.listGroups);
router.get("/groups/:id", groupsCtrl.getGroup);
router.post("/groups", groupsCtrl.createGroup);
router.put("/groups/:id", groupsCtrl.updateGroup);
router.patch("/groups/:id/close", groupsCtrl.closeGroup);
router.delete("/groups/:id/members/:userId", groupsCtrl.removeMember);
router.delete("/groups/:id", groupsCtrl.deleteGroup);

router.get("/reviews", manageCtrl.listReviews);
router.patch("/reviews/:id", manageCtrl.moderateReview);
router.delete("/reviews/:id", manageCtrl.deleteReview);

router.get("/coupons", manageCtrl.listCoupons);
router.post("/coupons", manageCtrl.createCoupon);
router.put("/coupons/:id", manageCtrl.updateCoupon);
router.delete("/coupons/:id", manageCtrl.deleteCoupon);

router.get("/settings", manageCtrl.getSettings);
router.put("/settings", manageCtrl.updateSettings);

module.exports = router;
