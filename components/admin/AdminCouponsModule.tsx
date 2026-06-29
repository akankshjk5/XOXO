"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface CouponRow {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minAmount?: number;
  expiresAt?: string;
  isActive?: boolean;
  usageCount?: number;
}

export function AdminCouponsModule() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    minAmount: 0,
    expiresAt: "",
    isActive: true,
  });

  const load = () => {
    setLoading(true);
    adminAPI
      .listCoupons()
      .then((res) => setCoupons(res.data.data || []))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.code) {
      toast.error("Coupon code required");
      return;
    }
    const payload = {
      ...form,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };
    try {
      if (editing) {
        await adminAPI.updateCoupon(editing._id, payload);
        toast.success("Coupon updated");
      } else {
        await adminAPI.createCoupon(payload);
        toast.success("Coupon created");
      }
      setOpen(false);
      load();
    } catch {
      toast.error("Save failed — code may already exist");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    try {
      await adminAPI.deleteCoupon(id);
      load();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <AdminHeader title="Coupons" subtitle="Promotional discount codes" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <button type="button" onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-green-dark text-white px-4 py-2.5 text-sm font-medium">
          <Plus className="h-4 w-4" /> New coupon
        </button>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Min spend</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Used</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-grey">No coupons yet</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-4 py-3">{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-4 py-3">₹{c.minAmount || 0}</td>
                    <td className="px-4 py-3 text-text-grey">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">{c.usageCount || 0}</td>
                    <td className="px-4 py-3">{c.isActive !== false ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => { setEditing(c); setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minAmount: c.minAmount || 0, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "", isActive: c.isActive !== false }); setOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => remove(c._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-semibold">{editing ? "Edit" : "Create"} coupon</h3>
            <input className="w-full border rounded-lg px-3 py-2 text-sm uppercase" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount (₹)</option>
            </select>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Min spend (₹)" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} />
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border rounded-lg py-2 text-sm">Cancel</button>
              <button type="button" onClick={save} className="flex-1 bg-green-dark text-white rounded-lg py-2 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
