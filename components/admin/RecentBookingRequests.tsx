"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Phone,
  Mail,
  MessageCircle,
  Eye,
  UserCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingsAPI } from "@/lib/api";
import {
  formatBookingStatus,
  phoneTelHref,
  whatsAppHref,
} from "@/lib/booking-status";
import { cn } from "@/lib/utils";

export interface RecentBookingRequest {
  _id: string;
  bookingRef?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  user?: { name?: string; email?: string; phone?: string };
  package?: {
    title?: string;
    destination?: { name?: string; country?: string };
  };
}

interface RecentBookingRequestsProps {
  bookings: RecentBookingRequest[];
  onUpdated?: () => void;
}

function formatINR(n?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function RecentBookingRequests({ bookings, onUpdated }: RecentBookingRequestsProps) {
  const [busy, setBusy] = useState<string | null>(null);

  const customerName = (b: RecentBookingRequest) =>
    b.contactName || b.user?.name || "Guest";
  const customerPhone = (b: RecentBookingRequest) =>
    b.contactPhone || b.user?.phone || "";
  const customerEmail = (b: RecentBookingRequest) =>
    b.contactEmail || b.user?.email || "";
  const destination = (b: RecentBookingRequest) =>
    b.package?.destination?.name ||
    b.package?.destination?.country ||
    "—";

  const markConfirmed = async (id: string) => {
    setBusy(`${id}-confirm`);
    try {
      await bookingsAPI.updateStatus(id, "consultant_assigned");
      toast.success("Marked as consultant assigned");
      onUpdated?.();
    } catch {
      toast.error("Could not update status");
    } finally {
      setBusy(null);
    }
  };

  const assignConsultant = async (id: string) => {
    const name = window.prompt("Consultant name");
    if (!name?.trim()) return;
    setBusy(`${id}-assign`);
    try {
      await bookingsAPI.assignConsultant(id, name.trim());
      toast.success(`Assigned to ${name.trim()}`);
      onUpdated?.();
    } catch {
      toast.error("Could not assign consultant");
    } finally {
      setBusy(null);
    }
  };

  if (!bookings.length) {
    return (
      <div className="admin-card p-5">
        <h3 className="font-medium text-text-dark">Recent Booking Requests</h3>
        <p className="mt-6 text-center text-sm text-text-grey py-8">No booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
        <div>
          <h3 className="font-medium text-text-dark">Recent Booking Requests</h3>
          <p className="text-xs text-text-grey mt-0.5">Contact customers immediately after enquiry</p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-xs font-semibold text-green-dark hover:underline shrink-0"
        >
          View all
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
            <tr>
              {["Booking ID", "Customer", "Phone", "Destination", "Amount", "Status", "Created", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-medium text-text-grey whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const phone = customerPhone(b);
              const tel = phoneTelHref(phone);
              const wa = whatsAppHref(phone);
              const email = customerEmail(b);
              return (
                <tr key={b._id} className="border-b border-[var(--admin-border)] last:border-0 hover:bg-off-white/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-text-dark">{b.bookingRef}</td>
                  <td className="px-4 py-3 font-medium text-text-dark">{customerName(b)}</td>
                  <td className="px-4 py-3">
                    {phone ? (
                      <a href={tel} className="font-bold text-green-dark hover:underline">
                        {phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-grey">{destination(b)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800 whitespace-nowrap">
                      {formatBookingStatus(b.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-grey whitespace-nowrap">
                    {b.createdAt
                      ? formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      id={b._id}
                      tel={tel}
                      wa={wa}
                      email={email}
                      busy={busy}
                      onConfirm={() => markConfirmed(b._id)}
                      onAssign={() => assignConsultant(b._id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-[var(--admin-border)]">
        {bookings.map((b) => {
          const phone = customerPhone(b);
          const tel = phoneTelHref(phone);
          const wa = whatsAppHref(phone);
          const email = customerEmail(b);
          return (
            <div key={b._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-green-dark">{b.bookingRef}</p>
                  <p className="font-semibold text-text-dark mt-0.5">{customerName(b)}</p>
                  <p className="text-xs text-text-grey">{b.package?.title}</p>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  {formatBookingStatus(b.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-text-grey">Phone</p>
                  {phone ? (
                    <a href={tel} className="font-bold text-green-dark">{phone}</a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div>
                  <p className="text-text-grey">Amount</p>
                  <p className="font-semibold">{formatINR(b.totalAmount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-grey">Destination</p>
                  <p>{destination(b)}</p>
                </div>
              </div>
              <ActionButtons
                id={b._id}
                tel={tel}
                wa={wa}
                email={email}
                busy={busy}
                onConfirm={() => markConfirmed(b._id)}
                onAssign={() => assignConsultant(b._id)}
                stacked
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionButtons({
  id,
  tel,
  wa,
  email,
  busy,
  onConfirm,
  onAssign,
  stacked,
}: {
  id: string;
  tel?: string;
  wa?: string;
  email?: string;
  busy: string | null;
  onConfirm: () => void;
  onAssign: () => void;
  stacked?: boolean;
}) {
  const btn =
    "inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--admin-border)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-text-dark hover:border-green-dark/40 hover:bg-green-dark/5 transition-colors min-h-[36px] disabled:opacity-50";

  return (
    <div className={cn("flex flex-wrap gap-1.5", stacked && "w-full")}>
      <Link href={`/admin/bookings`} className={btn} title="View in bookings">
        <Eye className="h-3.5 w-3.5" aria-hidden /> View
      </Link>
      {tel && (
        <a href={tel} className={btn}>
          <Phone className="h-3.5 w-3.5" aria-hidden /> Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={btn}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={btn}>
          <Mail className="h-3.5 w-3.5" aria-hidden /> Email
        </a>
      )}
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy === `${id}-confirm`}
        className={btn}
      >
        {busy === `${id}-confirm` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        )}
        Consultant assigned
      </button>
      <button
        type="button"
        onClick={onAssign}
        disabled={busy === `${id}-assign`}
        className={btn}
      >
        {busy === `${id}-assign` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" aria-hidden />
        )}
        Assign
      </button>
    </div>
  );
}
