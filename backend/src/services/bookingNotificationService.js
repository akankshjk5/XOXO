const logger = require("../config/logger");
const Package = require("../models/Package");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { sendWhatsApp } = require("../utils/whatsapp");
const { ADDON_LABELS } = require("../constants/addons");
const { formatBookingStatus, DEFAULT_BOOKING_STATUS } = require("../constants/bookingStatus");
const {
  bookingEnquiryCustomerEmail,
  bookingEnquiryOfficeEmail,
  buildCustomerEnquiryWhatsApp,
  buildOfficeAlertWhatsApp,
} = require("../utils/emailTemplates");

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatTravelDate(date) {
  if (!date) return "TBC";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAddOns(addOns = []) {
  if (!addOns.length) return "None selected";
  return addOns
    .map((a) => ADDON_LABELS[a.type] || a.type || "Add-on")
    .filter(Boolean)
    .join(", ");
}

async function resolveBookingContext(booking) {
  const user = await User.findById(booking.user).select("name email phone").lean();
  let packageTitle = "Holiday package";
  let destinationName = "";

  if (booking.package) {
    const pkg = await Package.findById(booking.package)
      .select("title destination")
      .populate("destination", "name country")
      .lean();
    if (pkg) {
      packageTitle = pkg.title;
      destinationName = pkg.destination?.name || pkg.destination?.country || "";
    }
  }

  const customerName =
    booking.contactName || booking.travelers?.[0]?.name || user?.name || "Traveller";
  const customerEmail = booking.contactEmail || user?.email || "";
  const customerPhone = booking.contactPhone || user?.phone || "";
  const status = booking.status || DEFAULT_BOOKING_STATUS;

  return {
    user,
    customerName,
    customerEmail,
    customerPhone,
    packageTitle,
    destinationName,
    travelDate: formatTravelDate(booking.travelDate),
    addOnsLabel: formatAddOns(booking.addOns),
    couponLabel: booking.couponCode || "None",
    estimatedAmount: formatINR(booking.totalAmount),
    statusLabel: formatBookingStatus(status),
    bookingTime: booking.createdAt
      ? new Date(booking.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    notes: booking.specialRequests || "—",
  };
}

/**
 * Sends customer + office notifications after a booking enquiry is created.
 * Never throws — booking creation must succeed even if notifications fail.
 */
async function notifyBookingCreated(booking) {
  const result = {
    customerEmail: { skipped: true },
    customerWhatsApp: { skipped: true },
    officeEmail: { skipped: true },
    officeWhatsApp: { skipped: true },
  };

  try {
    const ctx = await resolveBookingContext(booking);
    const payload = { booking, ...ctx };

    if (ctx.customerEmail) {
      const mail = bookingEnquiryCustomerEmail(payload);
      result.customerEmail = await sendEmail({ to: ctx.customerEmail, ...mail });
    } else {
      result.customerEmail = { skipped: true, reason: "no_customer_email" };
    }

    if (ctx.customerPhone) {
      const body = buildCustomerEnquiryWhatsApp(payload);
      result.customerWhatsApp = await sendWhatsApp({ to: ctx.customerPhone, body });
    } else {
      result.customerWhatsApp = { skipped: true, reason: "no_customer_phone" };
    }

    const officeEmail = process.env.BOOKING_OFFICE_EMAIL;
    if (officeEmail) {
      const mail = bookingEnquiryOfficeEmail(payload);
      result.officeEmail = await sendEmail({ to: officeEmail, ...mail });
    } else {
      result.officeEmail = { skipped: true, reason: "BOOKING_OFFICE_EMAIL not set" };
      logger.debug("Office email skipped — BOOKING_OFFICE_EMAIL not configured");
    }

    const officeWhatsApp = process.env.BOOKING_OFFICE_WHATSAPP;
    if (officeWhatsApp) {
      const body = buildOfficeAlertWhatsApp(payload);
      result.officeWhatsApp = await sendWhatsApp({ to: officeWhatsApp, body });
    } else {
      result.officeWhatsApp = { skipped: true, reason: "BOOKING_OFFICE_WHATSAPP not set" };
    }

    logger.info("Booking notifications processed", {
      bookingRef: booking.bookingRef,
      customerEmail: !result.customerEmail?.skipped,
      customerWhatsApp: !!result.customerWhatsApp?.sent,
      officeEmail: !result.officeEmail?.skipped,
      officeWhatsApp: !!result.officeWhatsApp?.sent,
    });
  } catch (err) {
    logger.warn("Booking notification service failed", {
      bookingRef: booking.bookingRef,
      error: err.message,
    });
  }

  return result;
}

module.exports = { notifyBookingCreated, resolveBookingContext, formatAddOns };
