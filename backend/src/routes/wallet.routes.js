const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/wallet.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", ctrl.getWallet);
router.post("/redeem", ctrl.redeemPoints);
router.post("/referral", ctrl.applyReferral);

module.exports = router;
