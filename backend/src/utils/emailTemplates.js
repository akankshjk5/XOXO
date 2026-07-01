const APP_NAME = "XOXO Travels";
const BRAND_COLOR = "#0D3D2E";
const ACCENT = "#0B6E4F";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@xoxo.travel";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+91 9240204872";

const { formatBookingStatus, DEFAULT_BOOKING_STATUS } = require("../constants/bookingStatus");
const { buildCustomerEnquiryWhatsApp, buildOfficeAlertWhatsApp } = require("./bookingMessages");

function layout(title, body, footerExtra = "") {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;box-shadow:0 4px 24px rgba(13,61,46,0.08)">
    <div style="background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT});padding:22px 24px">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">${APP_NAME}</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px">Premium travel for Indian explorers</p>
    </div>
    <div style="padding:24px;color:#333;line-height:1.65;font-size:15px">${body}</div>
    <div style="padding:18px 24px;background:#fafafa;font-size:13px;color:#666;border-top:1px solid #eee">
      <p style="margin:0 0 8px;font-weight:600;color:${BRAND_COLOR}">Need help?</p>
      <p style="margin:0">📞 <strong>${SUPPORT_PHONE}</strong></p>
      <p style="margin:6px 0 0">✉️ <a href="mailto:${SUPPORT_EMAIL}" style="color:${ACCENT}">${SUPPORT_EMAIL}</a></p>
      ${footerExtra}
      <p style="margin:14px 0 0;font-size:11px;color:#aaa">© ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body></html>`;
}

function detailsTable(rows) {
  return `<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
    ${rows
      .map(
        ([label, value]) =>
          `<tr>
            <td style="padding:10px 0;color:#666;border-bottom:1px solid #f0f0f0;width:42%">${label}</td>
            <td style="padding:10px 0;font-weight:600;color:#222;border-bottom:1px solid #f0f0f0">${value}</td>
          </tr>`
      )
      .join("")}
  </table>`;
}

function bookingEnquiryCustomerEmail({
  booking,
  customerName,
  packageTitle,
  destinationName,
  travelDate,
  addOnsLabel,
  couponLabel,
  estimatedAmount,
  statusLabel,
}) {
  const subject = "✈️ Your Booking Request has been Received – XOXO Travels";
  const status = statusLabel || formatBookingStatus(DEFAULT_BOOKING_STATUS);

  const html = layout(
    subject,
    `<h2 style="margin:0 0 12px;color:${BRAND_COLOR};font-size:20px">Your booking request is received</h2>
    <p>Hi ${customerName},</p>
    <p>Thank you for choosing <strong>${APP_NAME}</strong>. We have received your booking enquiry and our travel team is reviewing it.</p>
    ${detailsTable([
      ["Customer", customerName],
      ["Booking ID", booking.bookingRef],
      ["Package", packageTitle || "Holiday package"],
      ["Destination", destinationName || "—"],
      ["Travel date", travelDate],
      ["Travellers", String(booking.numTravelers || 1)],
      ["Selected add-ons", addOnsLabel],
      ["Coupon applied", couponLabel],
      ["Estimated amount", estimatedAmount],
      [
        "Booking status",
        `<span style="display:inline-block;background:#FEF3C7;color:#92400E;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">${status}</span>`,
      ],
    ])}
    <p style="margin-top:16px">A dedicated travel consultant will contact you shortly on your registered mobile number to confirm availability, hotels, flights, visa requirements, and optional services.</p>
    <p><a href="${process.env.CLIENT_URL || "https://xoxo-puce.vercel.app"}/dashboard?tab=bookings" style="display:inline-block;background:${ACCENT};color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">View my bookings</a></p>`
  );

  return {
    subject,
    html,
    text: `Booking ${booking.bookingRef} received. Status: ${status}. ${packageTitle}. ${travelDate}. ${estimatedAmount}`,
  };
}

function bookingEnquiryOfficeEmail({
  booking,
  customerName,
  customerEmail,
  customerPhone,
  packageTitle,
  destinationName,
  travelDate,
  addOnsLabel,
  couponLabel,
  estimatedAmount,
  statusLabel,
  bookingTime,
  notes,
}) {
  const subject = `🚨 NEW BOOKING — ${booking.bookingRef} — ${customerName}`;
  const status = statusLabel || formatBookingStatus(DEFAULT_BOOKING_STATUS);

  const html = layout(
    subject,
    `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;margin-bottom:18px">
      <p style="margin:0;font-size:12px;font-weight:700;color:#B91C1C;letter-spacing:0.05em">NEW BOOKING RECEIVED</p>
    </div>
    ${detailsTable([
      ["Booking ID", `<strong>${booking.bookingRef}</strong>`],
      ["Customer name", customerName],
      [
        "Phone",
        `<a href="tel:${String(customerPhone).replace(/\s/g, "")}" style="color:${ACCENT};font-size:18px;font-weight:800">${customerPhone || "—"}</a>`,
      ],
      ["Email", customerEmail || "—"],
      ["Destination", destinationName || "—"],
      ["Package", packageTitle || "—"],
      ["Travel date", travelDate],
      ["Travellers", String(booking.numTravelers || 1)],
      ["Add-ons", addOnsLabel],
      ["Coupon", couponLabel],
      ["Estimated amount", estimatedAmount],
      ["Booking time", bookingTime],
      ["Notes", notes],
      ["Status", status],
    ])}
    <p style="margin-top:12px;font-weight:600;color:${BRAND_COLOR}">Please contact the customer immediately.</p>`,
    `<p style="margin:8px 0 0"><a href="${process.env.CLIENT_URL || ""}/admin/bookings" style="color:${ACCENT}">Open admin bookings →</a></p>`
  );

  return {
    subject,
    html,
    text: `NEW BOOKING ${booking.bookingRef}. ${customerName}. Phone: ${customerPhone}. ${packageTitle}. ${estimatedAmount}`,
  };
}

function bookingConfirmationEmail({ user, booking, packageTitle, destinationName }) {
  return bookingEnquiryCustomerEmail({
    booking,
    customerName: user?.name || booking.contactName || "Traveller",
    packageTitle,
    destinationName,
    travelDate: booking.travelDate
      ? new Date(booking.travelDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "TBC",
    addOnsLabel: "See booking details",
    couponLabel: booking.couponCode || "None",
    estimatedAmount: `₹${(booking.totalAmount || 0).toLocaleString("en-IN")}`,
    statusLabel: formatBookingStatus(booking.status || DEFAULT_BOOKING_STATUS),
  });
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
  bookingEnquiryCustomerEmail,
  bookingEnquiryOfficeEmail,
  buildCustomerEnquiryWhatsApp,
  buildOfficeAlertWhatsApp,
  bookingConfirmationEmail,
  paymentConfirmationEmail,
  bookingUpdateEmail,
  socialNotificationEmail,
  sendVisaInquiryEmail,
  passwordResetEmail,
};
