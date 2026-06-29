"use client";

import { useCallback, useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export function AdminUsersModule() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");

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
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [search, roleFilter, blockedFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateUser = async (id: string, patch: { role?: string; isBlocked?: boolean }) => {
    try {
      await adminAPI.updateUser(id, patch);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...patch } : u)));
      toast.success("User updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <AdminHeader title="Users" subtitle="View and manage registered travelers" />
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
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-text-grey">{u.email}</td>
                    <td className="px-4 py-3 text-text-grey">{u.phone || u.phoneNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={(e) => updateUser(u._id, { role: e.target.value })} className="rounded-lg border px-2 py-1 text-xs">
                        <option value="user">user</option>
                        <option value="guide">guide</option>
                        <option value="admin">admin</option>
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
