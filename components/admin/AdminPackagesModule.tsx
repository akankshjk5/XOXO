"use client";

import { useEffect, useState } from "react";
import { packagesAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface PkgRow {
  _id: string;
  title: string;
  pricePerPerson: number;
  status?: string;
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

  const load = () => {
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

  return (
    <>
      <AdminHeader title="Packages" subtitle="Manage flags, visibility, and publish status" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Package</th>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Price</th>
                <th className="px-4 py-3 text-left font-medium text-text-grey">Status</th>
                {FLAGS.map((f) => (
                  <th key={f.key} className="px-2 py-3 text-center text-xs font-medium text-text-grey">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-grey">
                    Loading…
                  </td>
                </tr>
              ) : (
                packages.map((p) => (
                  <tr key={p._id} className="border-b border-[var(--admin-border)]">
                    <td className="px-4 py-3 font-medium text-text-dark max-w-[200px] truncate">
                      {p.title}
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
