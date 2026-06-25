const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/itinerary.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", ctrl.create);
router.get("/my", ctrl.getMy);
router.get("/:id", ctrl.getById);
router.delete("/:id", ctrl.remove);

module.exports = router;
