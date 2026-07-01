/** Booking lifecycle statuses — future-ready enum. */
const BOOKING_STATUSES = [
  "pending_office_confirmation",
  "consultant_assigned",
  "availability_checking",
  "payment_pending",
  "payment_received",
  "hotels_confirmed",
  "flights_confirmed",
  "visa_processing",
  "ready_to_travel",
  "completed",
  "cancelled",
  // legacy — kept for existing records
  "pending",
  "confirmed",
];

const BOOKING_STATUS_LABELS = {
  pending_office_confirmation: "Pending Office Confirmation",
  consultant_assigned: "Consultant Assigned",
  availability_checking: "Availability Checking",
  payment_pending: "Payment Pending",
  payment_received: "Payment Received",
  hotels_confirmed: "Hotels Confirmed",
  flights_confirmed: "Flights Confirmed",
  visa_processing: "Visa Processing",
  ready_to_travel: "Ready To Travel",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
  confirmed: "Confirmed",
};

const DEFAULT_BOOKING_STATUS = "pending_office_confirmation";

function formatBookingStatus(status) {
  return BOOKING_STATUS_LABELS[status] || status || BOOKING_STATUS_LABELS.pending_office_confirmation;
}

module.exports = {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  DEFAULT_BOOKING_STATUS,
  formatBookingStatus,
};
