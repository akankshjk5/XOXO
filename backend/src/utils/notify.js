const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./email");
const { socialNotificationEmail, bookingUpdateEmail } = require("./emailTemplates");
const logger = require("../config/logger");

const EMAIL_TYPES = new Set([
  "payment",
  "booking",
  "match",
  "friend",
  "group",
  "message",
  "social",
  "guide",
  "system",
]);

/**
 * Create in-app notification, push via Socket.io, and optionally send email.
 */
async function notify(app, { user, type, title, body, link, meta, email = true }) {
  const notification = await Notification.create({ user, type, title, body, link, meta });

  try {
    const io = app && app.get && app.get("io");
    if (io) io.to(String(user)).emit("notification", notification);
  } catch {
    /* socket optional */
  }

  if (email && EMAIL_TYPES.has(type)) {
    try {
      const recipient = await User.findById(user).select("name email emailNotifications");
      if (recipient?.email && recipient.emailNotifications !== false) {
        let mail;
        if (type === "payment" || type === "booking") {
          mail = socialNotificationEmail({ user: recipient, title, body, link });
        } else {
          mail = socialNotificationEmail({ user: recipient, title, body, link });
        }
        await sendEmail({ to: recipient.email, ...mail });
      }
    } catch (err) {
      logger.warn("Notification email failed", { user, type, error: err.message });
    }
  }

  return notification;
}

async function notifyBookingUpdate(app, { user, booking, message }) {
  const recipient = await User.findById(user).select("name email");
  if (!recipient) return;

  await notify(app, {
    user,
    type: "booking",
    title: `Booking update — ${booking.bookingRef}`,
    body: message,
    link: "/dashboard",
    email: false,
  });

  if (recipient.email) {
    const mail = bookingUpdateEmail({ user: recipient, booking, message });
    await sendEmail({ to: recipient.email, ...mail });
  }
}

module.exports = { notify, notifyBookingUpdate };
