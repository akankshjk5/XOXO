const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/nearby.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/me", ctrl.getMySettings);
router.put("/location", ctrl.updateLocation);
router.put("/privacy", ctrl.setPrivacy);
router.get("/", ctrl.discover);

module.exports = router;
