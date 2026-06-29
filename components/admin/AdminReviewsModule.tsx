"use client";

import { useCallback, useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface ReviewRow {
  _id: string;
  rating: number;
  comment?: string;
  status?: string;
  user?: { name?: string };
  package?: { title?: string };
  createdAt?: string;
}

export function AdminReviewsModule() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status !== "all") params.status = status;
    adminAPI
      .listReviews(params)
      .then((res) => setReviews(res.data.data || []))
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const moderate = async (id: string, newStatus: string) => {
    try {
      await adminAPI.moderateReview(id, newStatus);
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      toast.success(`Review ${newStatus}`);
    } catch {
      toast.error("Action failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await adminAPI.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <AdminHeader title="Reviews" subtitle="Approve, reject, or remove traveler reviews" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews…" className="rounded-lg border px-3 py-2 text-sm flex-1 max-w-md" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Comment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">No reviews</td></tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="border-b last:border-0">
                    <td className="px-4 py-3">{r.package?.title || "—"}</td>
                    <td className="px-4 py-3">{r.user?.name || "—"}</td>
                    <td className="px-4 py-3">{r.rating}★</td>
                    <td className="px-4 py-3 max-w-xs truncate text-text-grey">{r.comment}</td>
                    <td className="px-4 py-3 capitalize">{r.status || "approved"}</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button type="button" onClick={() => moderate(r._id, "approved")} className="text-xs px-2 py-1 rounded bg-green-dark/10 text-green-dark">Approve</button>
                      <button type="button" onClick={() => moderate(r._id, "rejected")} className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Reject</button>
                      <button type="button" onClick={() => remove(r._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
