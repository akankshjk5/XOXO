const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/booking.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/transport", ctrl.createTransport);
router.post("/", ctrl.create);
router.get("/my", ctrl.getMy);
router.get("/", adminOnly, ctrl.getAll);
router.get("/:id", ctrl.getById);
router.put("/:id/cancel", ctrl.cancel);
router.put("/:id/status", adminOnly, ctrl.updateStatus);
router.put("/:id/assign", adminOnly, ctrl.assignConsultant);

module.exports = router;
