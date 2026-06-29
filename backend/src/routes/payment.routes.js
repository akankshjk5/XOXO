const express = require("express");

const router = express.Router();

const ctrl = require("../controllers/payment.controller");

const { protect } = require("../middleware/auth.middleware");

const { paymentLimiter } = require("../middleware/rateLimiter");



router.use(paymentLimiter);

// Public — lets the checkout UI know demo vs live mode (no secrets exposed).
router.get("/status", ctrl.getStatus);

router.post("/order", protect, ctrl.createOrder);

router.post("/verify", protect, ctrl.verify);

router.post("/refund", protect, ctrl.refund);

router.get("/invoice/:bookingId", protect, ctrl.getInvoice);



module.exports = router;

