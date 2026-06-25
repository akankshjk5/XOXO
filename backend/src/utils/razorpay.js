const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../config/logger");
const { withRetry, logIntegrationFailure } = require("./integration");

let instance = null;

const isConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getRazorpay = () => {
  if (!isConfigured()) {
    throw new Error("Razorpay is not configured");
  }
  if (instance) return instance;
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
};

const verifySignature = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
};

const verifyWebhookSignature = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

/** Create order with retry (live mode only) */
async function createOrder(params) {
  return withRetry(
    () => getRazorpay().orders.create(params),
    { label: "razorpay:createOrder", maxAttempts: 3 }
  );
}

/** Refund payment with retry (live mode only) */
async function refundPayment(paymentId, params) {
  return withRetry(
    () => getRazorpay().payments.refund(paymentId, params),
    { label: "razorpay:refund", maxAttempts: 3 }
  );
}

function getRazorpayStatus() {
  const configured = isConfigured();
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  return {
    configured,
    live: configured && keyId.startsWith("rzp_live_"),
    mode: keyId.startsWith("rzp_live_") ? "live" : configured ? "test" : "demo",
    webhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    keyId: keyId ? `${keyId.slice(0, 12)}…` : null,
  };
}

module.exports = {
  getRazorpay,
  createOrder,
  refundPayment,
  verifySignature,
  verifyWebhookSignature,
  isConfigured,
  getRazorpayStatus,
};
