"use client";

import { useCallback, useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";
import { X, ChevronRight } from "lucide-react";

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
}

interface BookingRow {
  _id: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  package?: { title?: string };
}

export function AdminUsersModule() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [detail, setDetail] = useState<{ user: UserRow; bookings: BookingRow[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (roleFilter !== "all") params.role = roleFilter;
    if (blockedFilter === "blocked") params.blocked = "true";
    if (blockedFilter === "active") params.blocked = "false";
    adminAPI
      .listUsers(params)
      .then((res) => setUsers(res.data.data || []))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [search, roleFilter, blockedFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const { data } = await adminAPI.getUserDetail(id);
      setDetail(data.data);
    } catch {
      toast.error("Could not load customer profile");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateUser = async (id: string, patch: { role?: string; isBlocked?: boolean; isVerified?: boolean }) => {
    try {
      await adminAPI.updateUser(id, patch);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...patch } : u)));
      if (detail?.user._id === id) {
        setDetail((d) => (d ? { ...d, user: { ...d.user, ...patch } } : d));
      }
      toast.success("Customer updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <AdminHeader title="Customer Management" subtitle="Search customers, view booking history, verify and block accounts" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or phone…" className="rounded-lg border px-3 py-2 text-sm flex-1 max-w-md" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="guide">Guide</option>
            <option value="admin">Admin</option>
          </select>
          <select value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">No customers found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-[var(--admin-bg)]/50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-text-grey">{u.email}</td>
                    <td className="px-4 py-3 text-text-grey">{u.phone || u.phoneNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.isVerified ? "verified" : "unverified"}
                        onChange={(e) => updateUser(u._id, { isVerified: e.target.value === "verified" })}
                        className="rounded-lg border px-2 py-1 text-xs"
                      >
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.isBlocked ? "blocked" : "active"}
                        onChange={(e) => updateUser(u._id, { isBlocked: e.target.value === "blocked" })}
                        className="rounded-lg border px-2 py-1 text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(u._id)}
                        className="inline-flex items-center gap-1 text-green-dark font-medium text-xs hover:underline"
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
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/30">
            <div className="bg-white w-full max-w-md h-full shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Customer profile</h3>
                <button type="button" onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-off-white" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {detailLoading ? (
                <p className="p-6 text-text-grey text-sm">Loading…</p>
              ) : detail ? (
                <div className="p-5 space-y-5">
                  <div>
                    <p className="text-xl font-bold">{detail.user.name}</p>
                    <p className="text-sm text-text-grey">{detail.user.email}</p>
                    <p className="text-sm text-text-grey">{detail.user.phone || detail.user.phoneNumber || "No phone"}</p>
                    <p className="text-xs text-text-grey mt-1 capitalize">Role: {detail.user.role}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => updateUser(detail.user._id, { isVerified: !detail.user.isVerified })}
                      className="px-3 py-1.5 rounded-full border text-xs font-medium"
                    >
                      {detail.user.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateUser(detail.user._id, { isBlocked: !detail.user.isBlocked })}
                      className="px-3 py-1.5 rounded-full border text-xs font-medium text-red-600"
                    >
                      {detail.user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Booking history</h4>
                    {detail.bookings.length === 0 ? (
                      <p className="text-sm text-text-grey py-4 text-center border border-dashed rounded-xl">No bookings yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {detail.bookings.map((b) => (
                          <li key={b._id} className="border rounded-xl px-3 py-2 text-sm">
                            <p className="font-medium">{b.package?.title || "Booking"}</p>
                            <p className="text-xs text-text-grey capitalize">{b.status} · ₹{(b.totalAmount || 0).toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-text-grey">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}</p>
                          </li>
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
