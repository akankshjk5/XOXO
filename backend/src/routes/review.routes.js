const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/package/:packageId", ctrl.getForPackage);
router.post("/", protect, ctrl.create);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
