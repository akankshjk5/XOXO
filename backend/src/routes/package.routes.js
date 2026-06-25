const express = require("express");
const ctrl = require("../controllers/package.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

// Specific routes BEFORE :id to avoid collisions
router.get("/trending", ctrl.getTrending);
router.get("/visa-free", ctrl.getVisaFree);
router.get("/recent-bookings", ctrl.getRecentBookings);
router.get("/slug/:slug", ctrl.getBySlug);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

router.post("/", protect, adminOnly, ctrl.create);
router.put("/:id", protect, adminOnly, ctrl.update);
router.delete("/:id", protect, adminOnly, ctrl.remove);

module.exports = router;
