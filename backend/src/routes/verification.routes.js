const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/verification.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

router.get("/status", protect, ctrl.status);
router.post("/submit", protect, ctrl.submit);
router.get("/pending", protect, adminOnly, ctrl.pending);
router.put("/:id/review", protect, adminOnly, ctrl.review);

module.exports = router;
