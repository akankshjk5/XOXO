const { createOrder, refundPayment, verifySignature, verifyWebhookSignature, isConfigured, getRazorpayStatus } = require("../utils/razorpay");

const Booking = require("../models/Booking");

const Package = require("../models/Package");

const User = require("../models/User");

const WebhookEvent = require("../models/WebhookEvent");

const { notify } = require("../utils/notify");

const { record } = require("../controllers/wallet.controller");

const { generateInvoice } = require("../utils/invoice");

const { bookingConfirmationEmail } = require("../utils/emailTemplates");

const { sendEmail } = require("../utils/email");

const logger = require("../config/logger");

/** Shown in checkout UI when Razorpay env vars are not set on the API server. */
const DEMO_PAYMENT_MESSAGE =
  "Online payment will be enabled after the client configures their payment gateway.";



async function confirmBookingPayment(req, booking, paymentId) {

  if (booking.paymentStatus === "paid") return booking;



  booking.paymentStatus = "paid";

  booking.paidAmount = booking.totalAmount;

  booking.status = "confirmed";

  booking.razorpayPaymentId = paymentId || booking.razorpayPaymentId || `pay_demo_${Date.now()}`;

  await booking.save();



  const points = Math.round(booking.totalAmount * 0.01);

  const user = await User.findByIdAndUpdate(

    booking.user,

    { $inc: { rewardPoints: points } },

    { new: true }

  );



  let packageTitle = "Holiday package";

  if (booking.package) {

    const pkg = await Package.findById(booking.package).select("title");

    if (pkg) packageTitle = pkg.title;

  }



  try {

    const invoice = generateInvoice({ booking, user, packageTitle });

    booking.invoiceUrl = invoice.url;

    await booking.save();

  } catch (err) {

    logger.warn("Invoice generation failed", { error: err.message });

  }



  try {

    await record(booking.user, {

      kind: "reward",

      direction: "credit",

      amount: points,

      reason: `Booking ${booking.bookingRef}`,

      balanceAfter: user.rewardPoints,

    });

    await notify(req.app, {

      user: booking.user,

      type: "payment",

      title: "Booking confirmed 🎉",

      body: `Your booking ${booking.bookingRef} is confirmed. You earned ${points} reward points!`,

      link: "/dashboard",

    });



    const mail = bookingConfirmationEmail({ user, booking, packageTitle });

    await sendEmail({ to: user.email, ...mail });

  } catch (err) {

    logger.warn("Post-payment side effects failed", { error: err.message });

  }



  return booking;

}



// POST /api/payments/order  { bookingId }

exports.createOrder = async (req, res, next) => {

  try {

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (String(booking.user) !== String(req.user._id)) {

      return res.status(403).json({ success: false, message: "Not your booking" });

    }



    const amountPaise = Math.round(booking.totalAmount * 100);



    if (!isConfigured()) {

      const fakeOrderId = "order_demo_" + Date.now();

      booking.razorpayOrderId = fakeOrderId;

      await booking.save();

      return res.json({

        success: true,

        demo: true,

        data: {

          orderId: fakeOrderId,

          amount: amountPaise,

          currency: "INR",

          keyId: null,

        },

      });

    }



    const order = await createOrder({

      amount: amountPaise,

      currency: "INR",

      receipt: booking.bookingRef,

    });

    booking.razorpayOrderId = order.id;

    await booking.save();



    res.json({

      success: true,

      demo: false,

      data: {

        orderId: order.id,

        amount: order.amount,

        currency: order.currency,

        keyId: process.env.RAZORPAY_KEY_ID,

      },

    });

  } catch (err) {

    next(err);

  }

};



// POST /api/payments/verify

exports.verify = async (req, res, next) => {

  try {

    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (String(booking.user) !== String(req.user._id)) {

      return res.status(403).json({ success: false, message: "Not your booking" });

    }



    const demo = !isConfigured();

    if (!demo) {

      const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

      if (!valid) {

        booking.paymentStatus = "unpaid";

        await booking.save();

        return res.status(400).json({ success: false, message: "Payment verification failed" });

      }

    }



    const confirmed = await confirmBookingPayment(req, booking, razorpay_payment_id);

    res.json({ success: true, demo, data: confirmed });

  } catch (err) {

    next(err);

  }

};



// POST /api/payments/webhook — Razorpay server-to-server (raw body)

exports.webhook = async (req, res, next) => {

  try {

    const signature = req.headers["x-razorpay-signature"];

    const rawBody = req.body;



    if (isConfigured() && process.env.RAZORPAY_WEBHOOK_SECRET) {

      const valid = verifyWebhookSignature(rawBody, signature);

      if (!valid) {

        return res.status(400).json({ success: false, message: "Invalid webhook signature" });

      }

    }



    const payload = JSON.parse(rawBody.toString());

    const eventId = payload.event_id || `${payload.event}_${Date.now()}`;



    const existing = await WebhookEvent.findOne({ eventId });

    if (existing) {

      return res.json({ success: true, message: "Already processed" });

    }



    await WebhookEvent.create({ eventId, event: payload.event, payload });



    if (payload.event === "payment.captured") {

      const payment = payload.payload?.payment?.entity;

      const orderId = payment?.order_id;

      const paymentId = payment?.id;



      if (orderId) {

        const booking = await Booking.findOne({ razorpayOrderId: orderId });

        if (booking) {

          await confirmBookingPayment({ app: req.app }, booking, paymentId);

        }

      }

    }



    if (payload.event === "refund.processed") {

      const refund = payload.payload?.refund?.entity;

      const paymentId = refund?.payment_id;

      if (paymentId) {

        const booking = await Booking.findOne({ razorpayPaymentId: paymentId });

        if (booking) {

          booking.refundStatus = "processed";

          booking.refundedAmount = (refund.amount || 0) / 100;

          booking.status = "cancelled";

          await booking.save();

        }

      }

    }



    res.json({ success: true });

  } catch (err) {

    next(err);

  }

};



// POST /api/payments/refund  { bookingId, amount?, reason? } — admin or owner

exports.refund = async (req, res, next) => {

  try {

    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });



    const isOwner = String(booking.user) === String(req.user._id);

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {

      return res.status(403).json({ success: false, message: "Not authorized" });

    }



    if (booking.paymentStatus !== "paid") {

      return res.status(400).json({ success: false, message: "Booking is not paid" });

    }



    const refundAmount = amount || booking.paidAmount;

    const refundPaise = Math.round(refundAmount * 100);



    if (!isConfigured() || !booking.razorpayPaymentId?.startsWith("pay_")) {

      booking.refundStatus = "processed";

      booking.refundedAmount = refundAmount;

      booking.status = "cancelled";

      await booking.save();

      return res.json({ success: true, demo: true, data: booking });

    }



    const refund = await refundPayment(booking.razorpayPaymentId, {

      amount: refundPaise,

      notes: { reason: reason || "Customer requested refund", bookingRef: booking.bookingRef },

    });



    booking.refundStatus = "pending";

    booking.razorpayRefundId = refund.id;

    await booking.save();



    res.json({ success: true, data: { booking, refund } });

  } catch (err) {

    next(err);

  }

};



// GET /api/payments/invoice/:bookingId

exports.getInvoice = async (req, res, next) => {

  try {

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (String(booking.user) !== String(req.user._id) && req.user.role !== "admin") {

      return res.status(403).json({ success: false, message: "Not authorized" });

    }

    if (!booking.invoiceUrl) {

      return res.status(404).json({ success: false, message: "Invoice not generated yet" });

    }

    res.json({ success: true, data: { url: booking.invoiceUrl } });

  } catch (err) {

    next(err);

  }

};



// GET /api/payments/status — public; safe payment mode for checkout UI (no secrets).
exports.getStatus = (req, res) => {
  const status = getRazorpayStatus();
  res.json({
    success: true,
    data: {
      configured: status.configured,
      mode: status.mode,
      demo: !status.configured,
      live: status.live,
      webhook: status.webhook,
      message: status.configured ? null : DEMO_PAYMENT_MESSAGE,
    },
  });
};



module.exports.confirmBookingPayment = confirmBookingPayment;

