const logger = require("../config/logger");

const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+919240204872";

/**
 * Send WhatsApp message via Twilio when configured.
 * Returns { sent: true } or { skipped: true, reason } — never throws.
 */
async function sendWhatsApp({ to, body }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    return { skipped: true, reason: "whatsapp_not_configured" };
  }

  const digits = String(to || "").replace(/\D/g, "");
  if (digits.length < 10) {
    return { skipped: true, reason: "invalid_phone" };
  }

  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const toWhatsApp = `whatsapp:+${normalized}`;

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({
      From: from,
      To: toWhatsApp,
      Body: body,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.warn("WhatsApp send failed", { status: res.status, errText });
      return { skipped: true, reason: "send_failed" };
    }

    return { sent: true };
  } catch (err) {
    logger.warn("WhatsApp send error", { error: err.message });
    return { skipped: true, reason: "send_error" };
  }
}

function buildBookingWhatsAppMessage({ booking, packageTitle, destinationName }) {
  const date = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "TBC";

  return (
    `✅ *XOXO Travels — Booking Confirmed*\n\n` +
    `Booking ID: *${booking.bookingRef}*\n` +
    `Package: ${packageTitle || "Holiday package"}\n` +
    `Destination: ${destinationName || "—"}\n` +
    `Travel date: ${date}\n` +
    `Travellers: ${booking.numTravelers}\n` +
    `Amount paid: ₹${(booking.paidAmount || booking.totalAmount || 0).toLocaleString("en-IN")}\n` +
    `Status: ${booking.status || "confirmed"}\n\n` +
    `Need help? Call ${SUPPORT_PHONE}\n` +
    `View booking: ${process.env.CLIENT_URL || "https://xoxo-puce.vercel.app"}/dashboard?tab=bookings`
  );
}

module.exports = { sendWhatsApp, buildBookingWhatsAppMessage, SUPPORT_PHONE };
