const { formatBookingStatus, DEFAULT_BOOKING_STATUS } = require("../constants/bookingStatus");

function buildCustomerEnquiryWhatsApp({
  booking,
  customerName,
  packageTitle,
  destinationName,
  travelDate,
  estimatedAmount,
}) {
  const travellers = booking.numTravelers || 1;
  return (
    `Hello ${customerName} 👋\n\n` +
    `Thank you for choosing XOXO Travels.\n\n` +
    `We have received your booking enquiry.\n\n` +
    `Booking ID: *${booking.bookingRef}*\n` +
    `Destination: ${destinationName || "—"}\n` +
    `Package: ${packageTitle || "Holiday package"}\n` +
    `Travel Date: ${travelDate}\n` +
    `Travellers: ${travellers}\n` +
    `Estimated Amount: ${estimatedAmount}\n\n` +
    `Your travel consultant will contact you shortly to confirm:\n\n` +
    `• Availability\n` +
    `• Hotels\n` +
    `• Flights\n` +
    `• Visa requirements\n` +
    `• Optional services\n\n` +
    `Thank you for choosing XOXO Travels.`
  );
}

function buildOfficeAlertWhatsApp({
  booking,
  customerName,
  customerPhone,
  destinationName,
  packageTitle,
  travelDate,
  estimatedAmount,
}) {
  const travellers = booking.numTravelers || 1;
  return (
    `🚨 *NEW BOOKING*\n\n` +
    `Booking ID: *${booking.bookingRef}*\n` +
    `Customer: ${customerName}\n` +
    `Phone: *${customerPhone || "—"}*\n` +
    `Destination: ${destinationName || "—"}\n` +
    `Package: ${packageTitle || "—"}\n` +
    `Travel Date: ${travelDate}\n` +
    `Travellers: ${travellers}\n` +
    `Estimated Amount: ${estimatedAmount}\n\n` +
    `Please contact the customer immediately.`
  );
}

module.exports = { buildCustomerEnquiryWhatsApp, buildOfficeAlertWhatsApp };
