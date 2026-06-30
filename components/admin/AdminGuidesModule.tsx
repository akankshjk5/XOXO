"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminAPI, uploadAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface GuideRow {
  _id: string;
  city: string;
  country?: string;
  description?: string;
  hourlyRate?: number;
  dailyRate?: number;
  expertise?: string[];
  languages?: string[];
  photos?: string[];
  isVerified?: boolean;
  isAvailable?: boolean;
  user?: { _id: string; name: string; email: string };
}

const emptyForm = {
  userId: "",
  city: "",
  country: "",
  description: "",
  hourlyRate: "",
  dailyRate: "",
  expertise: "",
  languages: "",
  photos: [] as string[],
  isVerified: false,
  isAvailable: true,
};

export function AdminGuidesModule() {
  const [items, setItems] = useState<GuideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    adminAPI
      .listGuides(params)
      .then((res) => setItems(res.data.data || []))
      .catch(() => toast.error("Failed to load guides"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (g: GuideRow) => {
    setEditing(g);
    setForm({
      userId: g.user?._id || "",
      city: g.city,
      country: g.country || "",
      description: g.description || "",
      hourlyRate: g.hourlyRate != null ? String(g.hourlyRate) : "",
      dailyRate: g.dailyRate != null ? String(g.dailyRate) : "",
      expertise: (g.expertise || []).join(", "),
      languages: (g.languages || []).join(", "),
      photos: g.photos || [],
      isVerified: !!g.isVerified,
      isAvailable: g.isAvailable !== false,
    });
    setFormOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAPI.image(file);
      const url = data.data?.url || data.url;
      if (url) setForm((f) => ({ ...f, photos: [...f.photos, url] }));
      toast.success("Photo uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    if (!form.city) {
      toast.error("City is required");
      return;
    }
    if (!editing && !form.userId) {
      toast.error("User ID is required for new guides");
      return;
    }
    setSaving(true);
    const payload = {
      city: form.city,
      country: form.country,
      description: form.description,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
      dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
      expertise: form.expertise ? form.expertise.split(",").map((s) => s.trim()).filter(Boolean) : [],
      languages: form.languages ? form.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
      photos: form.photos,
      isVerified: form.isVerified,
      isAvailable: form.isAvailable,
    };
    try {
      if (editing) {
        await adminAPI.updateGuide(editing._id, payload);
        toast.success("Guide updated");
      } else {
        await adminAPI.createGuide({ ...payload, userId: form.userId });
        toast.success("Guide created");
      }
      setFormOpen(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete guide profile for ${name}?`)) return;
    try {
      await adminAPI.deleteGuide(id);
      toast.success("Guide deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <AdminHeader title="Guide Services" subtitle="Manage local guide profiles, verification, and availability" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, country, description…"
            className="rounded-lg border px-3 py-2 text-sm flex-1 max-w-md"
          />
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-green-dark text-white px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add guide
          </button>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Guide</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Rates</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">No guides found</td></tr>
              ) : (
                items.map((g) => (
                  <tr key={g._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{g.user?.name || "—"}</p>
                      <p className="text-xs text-text-grey">{g.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-grey">{g.city}{g.country ? `, ${g.country}` : ""}</td>
                    <td className="px-4 py-3 text-text-grey">
                      {g.dailyRate ? `₹${g.dailyRate}/day` : g.hourlyRate ? `₹${g.hourlyRate}/hr` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.isVerified ? "bg-green-dark/10 text-green-dark" : "bg-gray-100 text-text-grey"}`}>
                        {g.isVerified ? "Verified" : "Unverified"}
                      </span>
                      {!g.isAvailable && <span className="ml-1 text-xs text-amber-600">Unavailable</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEdit(g)} className="p-1.5 rounded border hover:bg-[var(--admin-bg)]" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => remove(g._id, g.user?.name || "guide")} className="p-1.5 rounded border text-red-500 hover:bg-red-50" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-4">{editing ? "Edit guide" : "Add guide"}</h3>
              <div className="space-y-3">
                {!editing && (
                  <Field label="User ID (MongoDB)" value={form.userId} onChange={(v) => setForm({ ...form, userId: v })} />
                )}
                <Field label="City *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Hourly rate (₹)" value={form.hourlyRate} onChange={(v) => setForm({ ...form, hourlyRate: v })} type="number" />
                  <Field label="Daily rate (₹)" value={form.dailyRate} onChange={(v) => setForm({ ...form, dailyRate: v })} type="number" />
                </div>
                <Field label="Expertise (comma-separated)" value={form.expertise} onChange={(v) => setForm({ ...form, expertise: v })} />
                <Field label="Languages (comma-separated)" value={form.languages} onChange={(v) => setForm({ ...form, languages: v })} />
                <div>
                  <span className="text-xs font-medium text-text-grey">Photos</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.photos.map((url) => (
                      <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }))} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1">×</button>
                      </div>
                    ))}
                  </div>
                  <label className="mt-2 inline-block text-sm text-green-dark font-medium cursor-pointer">
                    {uploading ? "Uploading…" : "+ Upload photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} />
                  Verified guide
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
                  Available for bookings
                </label>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setFormOpen(false)} className="flex-1 py-2 rounded-lg border text-sm">Cancel</button>
                <button type="button" onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-green-dark text-white text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-grey">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full mt-1 rounded-lg border px-3 py-2 text-sm" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 rounded-lg border px-3 py-2 text-sm" />
      )}
    </div>
  );
}
