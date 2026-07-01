"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";
import { LoadingSkeleton } from "@/components/motion";
import toast from "react-hot-toast";
import { X, ChevronRight, Trash2, Loader2, BadgeCheck } from "lucide-react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface BookingRow {
  _id: string;
  status?: string;
  paymentStatus?: string;
  totalAmount?: number;
  paidAmount?: number;
  createdAt?: string;
  package?: { title?: string };
}

interface WishItem {
  _id: string;
  title?: string;
  pricePerPerson?: number;
}

interface DestWish {
  _id: string;
  name?: string;
  country?: string;
}

export function AdminUsersModule() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [detail, setDetail] = useState<{
    user: UserRow;
    bookings: BookingRow[];
    wishlist: WishItem[];
    destinationWishlist: DestWish[];
    totalSpending: number;
    bookingCount: number;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams?.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const closeDetail = () => {
    setDetail(null);
    setDetailLoading(false);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (roleFilter !== "all") params.role = roleFilter;
    if (blockedFilter === "blocked") params.blocked = "true";
    if (blockedFilter === "active") params.blocked = "false";
    if (verifiedFilter === "verified") params.verified = "true";
    if (verifiedFilter === "unverified") params.verified = "false";
    adminAPI
      .listUsers(params)
      .then((res) => setUsers(res.data.data || []))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [search, roleFilter, blockedFilter, verifiedFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const { data } = await adminAPI.getUserDetail(id);
      setDetail(data.data);
    } catch {
      toast.error("Could not load customer profile");
      setDetailLoading(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateUser = async (id: string, patch: { role?: string; isBlocked?: boolean; isVerified?: boolean }) => {
    setActionLoading(id + JSON.stringify(patch));
    try {
      await adminAPI.updateUser(id, patch);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...patch } : u)));
      if (detail?.user._id === id) {
        setDetail((d) => (d ? { ...d, user: { ...d.user, ...patch } } : d));
      }
      toast.success("Customer updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    setActionLoading(`delete-${id}`);
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      closeDetail();
      toast.success("Customer deleted");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <>
      <AdminHeader title="Customer Management" subtitle="Search, verify, suspend, and view full customer profiles" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or phone…"
            className="rounded-lg border px-3 py-2 text-sm flex-1 min-w-[200px] max-w-md min-h-[44px]"
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="guide">Guide</option>
            <option value="admin">Admin</option>
          </select>
          <select value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="blocked">Suspended</option>
          </select>
          <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
            <option value="all">All verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <LoadingSkeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-grey">No customers found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-[var(--admin-bg)]/50">
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {u.name}
                        {u.isVerified && <BadgeCheck className="h-4 w-4 text-green-dark shrink-0" aria-label="Verified" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-grey">{u.email}</td>
                    <td className="px-4 py-3 text-text-grey">{u.phone || u.phoneNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => updateUser(u._id, { isVerified: !u.isVerified })}
                        className="rounded-full border px-3 py-1 text-xs font-medium min-h-[32px] disabled:opacity-50"
                      >
                        {actionLoading?.includes(u._id) ? <Loader2 className="h-3 w-3 animate-spin inline" /> : u.isVerified ? "Unverify" : "Verify"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => updateUser(u._id, { isBlocked: !u.isBlocked })}
                        className={`rounded-full border px-3 py-1 text-xs font-medium min-h-[32px] disabled:opacity-50 ${u.isBlocked ? "text-green-dark" : "text-red-600"}`}
                      >
                        {u.isBlocked ? "Activate" : "Suspend"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-grey text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(u._id)}
                        className="inline-flex items-center gap-1 text-green-dark font-medium text-xs hover:underline min-h-[32px]"
                      >
                        View profile <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(detail || detailLoading) && (
          <div
            className="fixed inset-0 z-[100] flex justify-end bg-black/30"
            onClick={closeDetail}
            role="presentation"
          >
            <div
              className="bg-white w-full max-w-md h-full shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-lg">Customer profile</h3>
                <button type="button" onClick={closeDetail} className="p-2 rounded-lg hover:bg-off-white min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {detailLoading ? (
                <div className="p-5 space-y-3">
                  <LoadingSkeleton className="h-8 w-48 rounded-lg" />
                  <LoadingSkeleton className="h-24 rounded-xl" />
                  <LoadingSkeleton className="h-32 rounded-xl" />
                </div>
              ) : detail ? (
                <div className="p-5 space-y-5">
                  <div>
                    <p className="text-xl font-bold flex items-center gap-2">
                      {detail.user.name}
                      {detail.user.isVerified && <VerifiedBadge />}
                    </p>
                    <p className="text-sm text-text-grey">{detail.user.email}</p>
                    <p className="text-sm text-text-grey">{detail.user.phone || detail.user.phoneNumber || "No phone"}</p>
                    <p className="text-xs text-text-grey mt-2">Joined: {fmtDate(detail.user.createdAt)}</p>
                    <p className="text-xs text-text-grey">Last login: {fmtDate(detail.user.lastLoginAt)}</p>
                    <p className="text-xs text-text-grey capitalize">Role: {detail.user.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3 bg-[var(--admin-bg)]">
                      <p className="text-xs text-text-grey">Total spending</p>
                      <p className="text-lg font-bold text-green-dark">₹{detail.totalSpending.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="rounded-xl border p-3 bg-[var(--admin-bg)]">
                      <p className="text-xs text-text-grey">Bookings</p>
                      <p className="text-lg font-bold">{detail.bookingCount}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => updateUser(detail.user._id, { isVerified: !detail.user.isVerified })}
                      className="px-3 py-2 rounded-full border text-xs font-medium min-h-[40px] disabled:opacity-50"
                    >
                      {detail.user.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => updateUser(detail.user._id, { isBlocked: !detail.user.isBlocked })}
                      className="px-3 py-2 rounded-full border text-xs font-medium min-h-[40px] disabled:opacity-50"
                    >
                      {detail.user.isBlocked ? "Activate" : "Suspend"}
                    </button>
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => deleteUser(detail.user._id, detail.user.name)}
                      className="px-3 py-2 rounded-full border border-red-200 text-red-600 text-xs font-medium min-h-[40px] inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Booking history</h4>
                    {detail.bookings.length === 0 ? (
                      <p className="text-sm text-text-grey py-4 text-center border border-dashed rounded-xl">No bookings yet</p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {detail.bookings.map((b) => (
                          <li key={b._id} className="border rounded-xl px-3 py-2 text-sm">
                            <p className="font-medium">{b.package?.title || "Booking"}</p>
                            <p className="text-xs text-text-grey capitalize">{b.status} · {b.paymentStatus} · ₹{(b.paidAmount || b.totalAmount || 0).toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-text-grey">{fmtDate(b.createdAt)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Package wishlist</h4>
                    {detail.wishlist.length === 0 ? (
                      <p className="text-sm text-text-grey">Empty</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {detail.wishlist.map((w) => (
                          <li key={w._id} className="text-text-dark">• {w.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Destination wishlist</h4>
                    {detail.destinationWishlist.length === 0 ? (
                      <p className="text-sm text-text-grey">Empty</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {detail.destinationWishlist.map((d) => (
                          <li key={d._id} className="text-text-dark">• {d.name}{d.country ? `, ${d.country}` : ""}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
