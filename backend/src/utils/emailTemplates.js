const APP_NAME = "XOXO Travels";
const BRAND_COLOR = "#0D3D2E";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@xoxo.travel";

function layout(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:${BRAND_COLOR};padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:20px">${APP_NAME}</h1>
    </div>
    <div style="padding:24px;color:#333;line-height:1.6">${body}</div>
    <div style="padding:16px 24px;background:#fafafa;font-size:12px;color:#888">
      Questions? Reply to this email or call +91 9240204872
    </div>
  </div>
</body></html>`;
}

function bookingConfirmationEmail({ user, booking, packageTitle, destinationName }) {
  const subject = `Booking confirmed — ${booking.bookingRef}`;
  const supportPhone = process.env.SUPPORT_PHONE || "+91 9240204872";
  const travelDate = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "TBC";

  const html = layout(
    subject,
    `<h2 style="margin-top:0;color:${BRAND_COLOR}">Your trip is confirmed! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>We've received your payment for <strong>${packageTitle || "your holiday package"}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 0;color:#666">Booking ID</td><td style="padding:8px 0;font-weight:600">${booking.bookingRef}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Destination</td><td style="padding:8px 0">${destinationName || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Package</td><td style="padding:8px 0">${packageTitle || "Holiday package"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Travel date</td><td style="padding:8px 0">${travelDate}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Travellers</td><td style="padding:8px 0">${booking.numTravelers}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Amount paid</td><td style="padding:8px 0;font-weight:600">₹${(booking.paidAmount || booking.totalAmount || 0).toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Status</td><td style="padding:8px 0;text-transform:capitalize">${booking.status || "confirmed"}</td></tr>
    </table>
    <p>Questions? Call <strong>${supportPhone}</strong> or reply to this email.</p>
    <p>View your booking anytime in your <a href="${process.env.CLIENT_URL}/dashboard?tab=bookings" style="color:${BRAND_COLOR}">dashboard</a>.</p>`
  );
  return {
    subject,
    html,
    text: `Booking ${booking.bookingRef} confirmed. ${packageTitle}. ${travelDate}. ₹${booking.paidAmount || booking.totalAmount}`,
  };
}

function paymentConfirmationEmail({ user, booking }) {
  return bookingConfirmationEmail({ user, booking, packageTitle: "your booking" });
}

function bookingUpdateEmail({ user, booking, message }) {
  const subject = `Booking update — ${booking.bookingRef}`;
  const html = layout(
    subject,
    `<p>Hi ${user.name},</p><p>${message}</p>
    <p>Reference: <strong>${booking.bookingRef}</strong></p>
    <p><a href="${process.env.CLIENT_URL}/dashboard" style="color:${BRAND_COLOR}">View dashboard</a></p>`
  );
  return { subject, html, text: message };
}

function socialNotificationEmail({ user, title, body, link }) {
  const subject = `${title} — ${APP_NAME}`;
  const html = layout(
    subject,
    `<p>Hi ${user.name},</p><p>${body}</p>
    ${link ? `<p><a href="${process.env.CLIENT_URL}${link}" style="color:${BRAND_COLOR}">Open in app</a></p>` : ""}`
  );
  return { subject, html, text: body };
}

function sendVisaInquiryEmail(inquiry) {
  const { sendEmail } = require("./email");
  const desk = process.env.VISA_DESK_EMAIL || SUPPORT_EMAIL;
  const subject = `New visa inquiry — ${inquiry.destination}`;
  const html = layout(
    subject,
    `<p><strong>${inquiry.name}</strong> (${inquiry.email})</p>
    <p>Destination: ${inquiry.destination}</p>
    ${inquiry.phone ? `<p>Phone: ${inquiry.phone}</p>` : ""}
    ${inquiry.message ? `<p>Message: ${inquiry.message}</p>` : ""}`
  );
  return sendEmail({ to: desk, subject, html, text: `Visa inquiry from ${inquiry.email} for ${inquiry.destination}` });
}

function passwordResetEmail({ user, resetUrl }) {
  const subject = "Reset your XOXO Travels password";
  const html = layout(
    subject,
    `<p>Hi ${user.name},</p>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Reset password</a></p>
    <p style="font-size:13px;color:#888">If you didn't request this, ignore this email.</p>`
  );
  return { subject, html, text: `Reset password: ${resetUrl}` };
}

module.exports = {
  bookingConfirmationEmail,
  paymentConfirmationEmail,
  bookingUpdateEmail,
  socialNotificationEmail,
  sendVisaInquiryEmail,
  passwordResetEmail,
};
