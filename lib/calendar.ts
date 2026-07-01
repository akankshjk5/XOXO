/** Build a simple ICS file for adding a booking to calendar apps. */
export function buildBookingIcs(opts: {
  title: string;
  bookingRef: string;
  travelDate: string;
  durationHours?: number;
}) {
  const start = new Date(opts.travelDate);
  const end = new Date(start.getTime() + (opts.durationHours ?? 24) * 3600000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//XOXO Travels//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${opts.bookingRef}@xoxotravels.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:Booking ${opts.bookingRef} — XOXO Travels`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
