"use client";

import { useEffect, useState, useCallback } from "react";
import { bookingsAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataLoadError } from "@/components/ui/DataLoadError";
import { formatDistanceToNow } from "date-fns";
import {
  ADMIN_BOOKING_STATUSES,
  formatBookingStatus,
} from "@/lib/booking-status";

interface BookingRow {
  _id: string;
  bookingRef?: string;
  status?: string;
  paymentStatus?: string;
  totalAmount?: number;
  createdAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  user?: { name?: string; email?: string; phone?: string };
  package?: { title?: string; destination?: { name?: string } };
}

export function AdminBookingsModule() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;
    bookingsAPI
      .getAll(params)
      .then((res) => {
        setBookings(res.data.data || []);
        setError(null);
      })
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await bookingsAPI.updateStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch {
      setError("Could not update booking status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <AdminHeader title="Bookings" subtitle="Live booking table — approve, cancel, and manage trips" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email, phone, or package…"
            className="rounded-lg border px-3 py-2 text-sm flex-1 max-w-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {ADMIN_BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{formatBookingStatus(s)}</option>
            ))}
            <option value="pending">Pending (legacy)</option>
            <option value="confirmed">Confirmed (legacy)</option>
          </select>
        </div>
        {error && (
          <DataLoadError message={error} onRetry={load} className="mb-4" />
        )}

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-grey">Customer</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Package</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Amount</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Payment</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Status</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Created</th>
                  <th className="px-4 py-3 font-medium text-text-grey">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-grey">
                      <div className="admin-skeleton mx-auto h-8 w-48" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-grey">
                      <p className="text-2xl mb-2" aria-hidden>📅</p>
                      <p className="font-medium text-text-dark">No bookings yet</p>
                      <p className="text-xs mt-1">Customer bookings will appear here in real time.</p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[var(--admin-border)] last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-dark">{booking.contactName || booking.user?.name || "—"}</p>
                        <p className="text-xs text-text-grey">{booking.contactEmail || booking.user?.email}</p>
                        {(booking.contactPhone || booking.user?.phone) && (
                          <p className="text-xs font-semibold text-green-dark">{booking.contactPhone || booking.user?.phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-dark">{booking.package?.title || "—"}</td>
                      <td className="px-4 py-3">₹{(booking.totalAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 capitalize text-text-grey">{booking.paymentStatus}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-dark/10 px-2 py-0.5 text-xs font-medium text-green-dark whitespace-nowrap">
                          {formatBookingStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-grey">
                        {booking.createdAt
                          ? formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={booking.status || "pending_office_confirmation"}
                          disabled={updating === booking._id}
                          onChange={(e) => updateStatus(booking._id, e.target.value)}
                          className="rounded-lg border border-[var(--admin-border)] bg-white px-2 py-1 text-xs max-w-[160px]"
                          aria-label={`Update status for booking ${booking.bookingRef || booking._id}`}
                        >
                          {ADMIN_BOOKING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {formatBookingStatus(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
