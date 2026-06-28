const express = require("express");
const ctrl = require("../controllers/analytics.controller");
const optionalAuth = require("../middleware/optionalAuth").optionalAuth;
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/track", optionalAuth, ctrl.track);
router.get("/summary", protect, adminOnly, ctrl.summary);

module.exports = router;
