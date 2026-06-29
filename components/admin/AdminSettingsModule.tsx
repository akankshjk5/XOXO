"use client";

import { useEffect, useState } from "react";
import { adminAPI, uploadAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataLoadError } from "@/components/ui/DataLoadError";
import toast from "react-hot-toast";

interface SiteSettings {
  websiteName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
}

export function AdminSettingsModule() {
  const [form, setForm] = useState<SiteSettings>({
    websiteName: "XOXO Travels",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    socialFacebook: "",
    socialInstagram: "",
    socialTwitter: "",
    socialLinkedin: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError(null);
    adminAPI
      .getSettings()
      .then((res) => {
        setForm((f) => ({ ...f, ...(res.data.data as Partial<SiteSettings>) }));
        setLoadError(null);
      })
      .catch(() => setLoadError("Failed to load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(form as unknown as Record<string, unknown>);
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await uploadAPI.image(file);
      const url = data.data?.url || data.url;
      if (url) setForm((f) => ({ ...f, logo: url }));
    } catch {
      toast.error("Logo upload failed");
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Settings" subtitle="Website branding and contact" />
        <div className="p-8 text-center text-text-grey">Loading…</div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <AdminHeader title="Settings" subtitle="Website branding and contact" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
          <DataLoadError message={loadError} onRetry={load} />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Settings" subtitle="Website name, logo, and contact details" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <div className="admin-card p-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-text-grey">Website name</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.websiteName} onChange={(e) => setForm({ ...form, websiteName: e.target.value })} />
          </label>
          <div>
            <span className="text-xs font-medium text-text-grey">Logo</span>
            <input type="file" accept="image/*" onChange={uploadLogo} className="mt-1 block text-sm" />
            {form.logo && <p className="text-xs text-text-grey mt-1 truncate">{form.logo}</p>}
          </div>
          <label className="block">
            <span className="text-xs font-medium text-text-grey">Contact email</span>
            <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-text-grey">Contact phone</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-text-grey">Address</span>
            <textarea rows={2} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <p className="text-sm font-medium text-text-dark pt-2">Social media</p>
          {(["socialFacebook", "socialInstagram", "socialTwitter", "socialLinkedin"] as const).map((key) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-text-grey capitalize">{key.replace("social", "")}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="https://" />
            </label>
          ))}
          <button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto bg-green-dark text-white rounded-lg px-6 py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </>
  );
}
