/** Booking status labels — mirrors backend constants/bookingStatus.js */

export const BOOKING_STATUS_LABELS: Record<string, string> = {
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

export const ADMIN_BOOKING_STATUSES = [
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
] as const;

export function formatBookingStatus(status?: string): string {
  if (!status) return BOOKING_STATUS_LABELS.pending_office_confirmation;
  return BOOKING_STATUS_LABELS[status] || status.replace(/_/g, " ");
}

export function phoneTelHref(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export function whatsAppHref(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${normalized}`;
}
