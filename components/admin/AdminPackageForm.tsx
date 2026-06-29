"use client";

import { useEffect, useState } from "react";
import { packagesAPI, destinationsAPI } from "@/lib/api";
import {
  PACKAGE_CATEGORIES,
  CATEGORY_LABELS,
  CORPORATE_TRAVEL_TYPES,
} from "@/lib/travel-categories";
import type { CorporatePackageInfo, PackageRecord } from "@/lib/package-types";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface DestinationOption {
  _id: string;
  name: string;
  country?: string;
}

interface Props {
  open: boolean;
  initial?: PackageRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_CORPORATE: CorporatePackageInfo = {
  supportsInvoice: true,
  supportsGst: true,
  airportTransfers: true,
  dedicatedTravelManager: false,
  customPricing: false,
  negotiatedHotels: false,
  travelTypes: [],
};

export function AdminPackageForm({ open, initial, onClose, onSaved }: Props) {
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<PackageRecord>>({
    title: "",
    description: "",
    durationDays: 5,
    durationNights: 4,
    pricePerPerson: 50000,
    category: "family",
    status: "published",
    minPeople: 1,
    maxPeople: 12,
    corporate: { ...EMPTY_CORPORATE },
  });

  useEffect(() => {
    if (!open) return;
    destinationsAPI
      .getAll({ limit: 50 })
      .then((res) => setDestinations(res.data.data || []))
      .catch(() => toast.error("Could not load destinations"));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        ...initial,
        destination:
          typeof initial.destination === "object"
            ? initial.destination?._id
            : initial.destination,
        corporate: initial.corporate || { ...EMPTY_CORPORATE },
      });
    } else {
      setForm({
        title: "",
        description: "",
        durationDays: 5,
        durationNights: 4,
        pricePerPerson: 50000,
        category: "family",
        status: "published",
        minPeople: 1,
        maxPeople: 12,
        corporate: { ...EMPTY_CORPORATE },
      });
    }
  }, [open, initial]);

  const setCorporate = (patch: Partial<CorporatePackageInfo>) => {
    setForm((f) => ({
      ...f,
      corporate: { ...EMPTY_CORPORATE, ...f.corporate, ...patch },
    }));
  };

  const toggleTravelType = (id: string) => {
    const current = form.corporate?.travelTypes || [];
    const next = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    setCorporate({ travelTypes: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      destination: form.destination || undefined,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      pricePerPerson: Number(form.pricePerPerson),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      status: form.status,
      minPeople: Number(form.minPeople),
      maxPeople: Number(form.maxPeople),
    };
    if (form.category === "corporate") {
      payload.corporate = form.corporate;
      payload.maxPeople = Math.max(Number(form.maxPeople) || 10, 10);
    }

    try {
      if (initial?._id) {
        await packagesAPI.update(initial._id, payload);
        toast.success("Package updated");
      } else {
        await packagesAPI.create(payload);
        toast.success("Package created");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
      >
        <div className="sticky top-0 bg-white border-b border-[var(--admin-border)] px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-dark">
            {initial ? "Edit package" : "Create package"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-grey">Title</span>
              <input
                required
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-grey">Description</span>
              <textarea
                rows={3}
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Category</span>
              <select
                value={form.category || "family"}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              >
                {PACKAGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c] || c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Destination</span>
              <select
                value={(form.destination as string) || ""}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                    {d.country ? `, ${d.country}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Days</span>
              <input
                type="number"
                min={1}
                value={form.durationDays || 1}
                onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Nights</span>
              <input
                type="number"
                min={0}
                value={form.durationNights ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, durationNights: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Price / person (₹)</span>
              <input
                type="number"
                min={0}
                value={form.pricePerPerson || 0}
                onChange={(e) => setForm((f) => ({ ...f, pricePerPerson: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Status</span>
              <select
                value={form.status || "published"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Min people</span>
              <input
                type="number"
                min={1}
                value={form.minPeople || 1}
                onChange={(e) => setForm((f) => ({ ...f, minPeople: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-grey">Max people</span>
              <input
                type="number"
                min={1}
                value={form.maxPeople || 12}
                onChange={(e) => setForm((f) => ({ ...f, maxPeople: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
          </div>

          {form.category === "corporate" && (
            <fieldset className="rounded-xl border border-[var(--admin-border)] p-4 space-y-3">
              <legend className="text-sm font-semibold text-text-dark px-1">Corporate details</legend>
              <label className="block">
                <span className="text-xs font-medium text-text-grey">Company name</span>
                <input
                  value={form.corporate?.companyName || ""}
                  onChange={(e) => setCorporate({ companyName: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-text-grey">Min employees</span>
                  <input
                    type="number"
                    min={1}
                    value={form.corporate?.employeeCountMin || ""}
                    onChange={(e) => setCorporate({ employeeCountMin: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-text-grey">Max employees</span>
                  <input
                    type="number"
                    min={1}
                    value={form.corporate?.employeeCountMax || ""}
                    onChange={(e) => setCorporate({ employeeCountMax: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-text-grey">Meeting location</span>
                <input
                  value={form.corporate?.meetingLocation || ""}
                  onChange={(e) => setCorporate({ meetingLocation: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>
              <div>
                <span className="text-xs font-medium text-text-grey">Travel types</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CORPORATE_TRAVEL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTravelType(t.id)}
                      className={`rounded-full px-3 py-1 text-xs border ${
                        form.corporate?.travelTypes?.includes(t.id)
                          ? "bg-green-dark text-white border-green-dark"
                          : "border-gray-300 text-text-grey"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                {(
                  [
                    ["supportsInvoice", "Invoice support"],
                    ["supportsGst", "GST support"],
                    ["dedicatedTravelManager", "Dedicated travel manager"],
                    ["customPricing", "Custom pricing"],
                    ["negotiatedHotels", "Negotiated hotels"],
                    ["airportTransfers", "Airport transfers"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.corporate?.[key]}
                      onChange={(e) => setCorporate({ [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-green-dark text-white px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving…" : initial ? "Update package" : "Create package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
