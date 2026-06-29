"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPackageForm } from "@/components/admin/AdminPackageForm";
import { CATEGORY_LABELS } from "@/lib/travel-categories";
import type { PackageRecord } from "@/lib/package-types";
import toast from "react-hot-toast";

interface PkgRow extends PackageRecord {
  featured?: boolean;
  trending?: boolean;
  isLuxury?: boolean;
  isPopular?: boolean;
  isVisaFree?: boolean;
  isHidden?: boolean;
  isActive?: boolean;
}

const FLAGS: { key: keyof PkgRow; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "trending", label: "Trending" },
  { key: "isVisaFree", label: "Visa Free" },
  { key: "isLuxury", label: "Luxury" },
  { key: "isPopular", label: "Popular" },
  { key: "isHidden", label: "Hidden" },
];

export function AdminPackagesModule() {
  const [packages, setPackages] = useState<PkgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PkgRow | null>(null);

  const load = () => {
    setLoading(true);
    packagesAPI
      .getAllAdmin()
      .then((res) => setPackages(res.data.data || []))
      .catch(() => toast.error("Failed to load packages"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFlag = async (id: string, key: string, value: boolean) => {
    try {
      await packagesAPI.update(id, { [key]: value });
      setPackages((prev) =>
        prev.map((p) => (p._id === id ? { ...p, [key]: value } : p))
      );
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const setStatus = async (id: string, status: "draft" | "published") => {
    try {
      await packagesAPI.update(id, { status });
      setPackages((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await packagesAPI.remove(id);
      setPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success("Package deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = packages.filter((p) => {
    const matchSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <>
      <AdminHeader
        title="Packages"
        subtitle="Create, edit, and manage package inventory including corporate travel"
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages…"
              className="flex-1 rounded-lg border px-3 py-2 text-sm max-w-md"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_LABELS)
                .filter(([k]) => k !== "all" && k !== "couple")
                .map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-dark text-white px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New package
          </button>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Package</th>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Category</th>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Price</th>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Status</th>
                {FLAGS.map((f) => (
                  <th key={f.key} className="px-2 py-3 text-center text-xs font-medium text-text-grey">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-text-grey">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-text-grey">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-text-grey">
                    No packages match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="border-b border-[var(--admin-border)]">
                    <td className="px-4 py-3 font-medium text-text-dark max-w-[220px] truncate">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 capitalize text-text-grey">
                      {CATEGORY_LABELS[p.category || ""] || p.category}
                    </td>
                    <td className="px-4 py-3">₹{p.pricePerPerson?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status || "published"}
                        onChange={(e) => setStatus(p._id, e.target.value as "draft" | "published")}
                        className="rounded-lg border px-2 py-1 text-xs"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </td>
                    {FLAGS.map((f) => (
                      <td key={f.key} className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!p[f.key as keyof PkgRow]}
                          onChange={(e) => toggleFlag(p._id, f.key, e.target.checked)}
                          aria-label={`${f.label} for ${p.title}`}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p._id, p.title)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          aria-label={`Delete ${p.title}`}
                        >
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
      </div>

      <AdminPackageForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />
    </>
  );
}
