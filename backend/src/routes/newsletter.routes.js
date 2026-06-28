const express = require("express");
const ctrl = require("../controllers/newsletter.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/subscribe", ctrl.subscribe);
router.get("/export", protect, adminOnly, ctrl.exportCsv);
router.get("/count", protect, adminOnly, ctrl.count);

module.exports = router;
