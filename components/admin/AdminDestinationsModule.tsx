"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { destinationsAPI, uploadAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataLoadError } from "@/components/ui/DataLoadError";
import toast from "react-hot-toast";

interface DestRow {
  _id: string;
  name: string;
  country: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  isTrending?: boolean;
  isActive?: boolean;
}

export function AdminDestinationsModule() {
  const [items, setItems] = useState<DestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DestRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "",
    description: "",
    coverImage: "",
    isTrending: false,
    isActive: true,
  });

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    destinationsAPI
      .getAll(search ? { search } : undefined)
      .then((res) => {
        setItems(res.data.data || []);
        setLoadError(null);
      })
      .catch(() => setLoadError("Failed to load destinations"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", country: "", description: "", coverImage: "", isTrending: false, isActive: true });
    setFormOpen(true);
  };

  const openEdit = async (d: DestRow) => {
    setEditing(d);
    setFormOpen(true);
    try {
      const { data } = await destinationsAPI.getById(d._id);
      const full = data.data as DestRow;
      setForm({
        name: full.name,
        country: full.country,
        description: full.description || "",
        coverImage: full.coverImage || "",
        isTrending: !!full.isTrending,
        isActive: full.isActive !== false,
      });
    } catch {
      setForm({
        name: d.name,
        country: d.country,
        description: d.description || "",
        coverImage: d.coverImage || "",
        isTrending: !!d.isTrending,
        isActive: d.isActive !== false,
      });
      toast.error("Could not load full destination details");
    }
  };

  const save = async () => {
    if (!form.name || !form.country) {
      toast.error("Name and country are required");
      return;
    }
    setSaving(true);
    const slug = `${form.name}-${form.country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = { ...form, slug };
    try {
      if (editing) {
        await destinationsAPI.update(editing._id, payload);
        toast.success("Destination updated");
      } else {
        await destinationsAPI.create(payload);
        toast.success("Destination created");
      }
      setFormOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await destinationsAPI.remove(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await uploadAPI.image(file);
      const url = data.data?.url || data.url;
      if (url) setForm((f) => ({ ...f, coverImage: url }));
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <>
      <AdminHeader title="Destinations" subtitle="Manage countries and cities" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations…"
            className="rounded-lg border px-3 py-2 text-sm max-w-md"
          />
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-green-dark text-white px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New destination
          </button>
        </div>

        {loadError && <DataLoadError message={loadError} onRetry={load} />}

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-center">Popular</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : items.length === 0 && !loadError ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-grey">No destinations found</td></tr>
              ) : (
                items.map((d) => (
                  <tr key={d._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-text-grey">{d.country}</td>
                    <td className="px-4 py-3 text-center">{d.isTrending ? "Yes" : "—"}</td>
                    <td className="px-4 py-3 text-center">{d.isActive !== false ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openEdit(d)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(d._id, d.name)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg">{editing ? "Edit" : "Create"} destination</h3>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <input type="file" accept="image/*" onChange={uploadCover} />
              {form.coverImage && <p className="text-xs text-text-grey mt-1 truncate">{form.coverImage}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} /> Popular / Trending</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="flex-1 border rounded-lg py-2 text-sm">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="flex-1 bg-green-dark text-white rounded-lg py-2 text-sm disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
