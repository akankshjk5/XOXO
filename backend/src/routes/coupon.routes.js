const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/coupon.controller");

const router = express.Router();

router.post("/validate", protect, ctrl.validate);

module.exports = router;
