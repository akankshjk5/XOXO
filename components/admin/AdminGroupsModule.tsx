"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Lock } from "lucide-react";
import { adminAPI, uploadAPI } from "@/lib/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface MemberRow {
  user?: { _id: string; name: string; email?: string; phone?: string };
  role?: string;
}

interface GroupRow {
  _id: string;
  title: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  maxMembers?: number;
  description?: string;
  tripStyle?: string;
  costPerPerson?: number;
  coverImage?: string;
  status?: string;
  creator?: { name?: string; email?: string };
  members?: MemberRow[];
}

const emptyForm = {
  title: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  maxMembers: "10",
  description: "",
  tripStyle: "",
  costPerPerson: "",
  coverImage: "",
  status: "open",
  creatorId: "",
};

export function AdminGroupsModule() {
  const [items, setItems] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState<GroupRow | null>(null);
  const [editing, setEditing] = useState<GroupRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;
    adminAPI
      .listGroups(params)
      .then((res) => setItems(res.data.data || []))
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (g: GroupRow) => {
    setEditing(g);
    setForm({
      title: g.title,
      destination: g.destination,
      departureDate: g.departureDate?.slice(0, 10) || "",
      returnDate: g.returnDate?.slice(0, 10) || "",
      maxMembers: String(g.maxMembers || 10),
      description: g.description || "",
      tripStyle: g.tripStyle || "",
      costPerPerson: g.costPerPerson != null ? String(g.costPerPerson) : "",
      coverImage: g.coverImage || "",
      status: g.status || "open",
      creatorId: "",
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.destination || !form.departureDate) {
      toast.error("Title, destination, and departure date are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      destination: form.destination,
      departureDate: form.departureDate,
      returnDate: form.returnDate || undefined,
      maxMembers: Number(form.maxMembers) || 10,
      description: form.description,
      tripStyle: form.tripStyle,
      costPerPerson: form.costPerPerson ? Number(form.costPerPerson) : undefined,
      coverImage: form.coverImage,
      status: form.status,
      ...(form.creatorId ? { creatorId: form.creatorId } : {}),
    };
    try {
      if (editing) {
        await adminAPI.updateGroup(editing._id, payload);
        toast.success("Group updated");
      } else {
        await adminAPI.createGroup(payload);
        toast.success("Group created");
      }
      setFormOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const closeGroup = async (id: string) => {
    if (!confirm("Close this group? New members cannot join.")) return;
    try {
      await adminAPI.closeGroup(id);
      toast.success("Group closed");
      load();
    } catch {
      toast.error("Could not close group");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete group "${title}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteGroup(id);
      toast.success("Group deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const removeMember = async (groupId: string, userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this group?`)) return;
    try {
      const { data } = await adminAPI.removeGroupMember(groupId, userId);
      toast.success("Member removed");
      if (membersOpen?._id === groupId) {
        setMembersOpen({ ...membersOpen, members: data.data?.members || [] });
      }
      load();
    } catch {
      toast.error("Could not remove member");
    }
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await uploadAPI.image(file);
      const url = data.data?.url || data.url;
      if (url) setForm((f) => ({ ...f, coverImage: url }));
      toast.success("Cover uploaded");
    } catch {
      toast.error("Upload failed");
    }
    e.target.value = "";
  };

  return (
    <>
      <AdminHeader title="Group Travellers" subtitle="Create, edit, close groups and view members" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or destination…" className="rounded-lg border px-3 py-2 text-sm flex-1 max-w-md" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-green-dark text-white px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Create group
          </button>
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-[var(--admin-bg)]">
              <tr>
                <th className="px-4 py-3 text-left">Group</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Departure</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-grey">No groups found</td></tr>
              ) : (
                items.map((g) => (
                  <tr key={g._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{g.title}</p>
                      <p className="text-xs text-text-grey">by {g.creator?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-text-grey">{g.destination}</td>
                    <td className="px-4 py-3 text-text-grey">{g.departureDate ? new Date(g.departureDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setMembersOpen(g)} className="inline-flex items-center gap-1 text-green-dark font-medium text-xs">
                        <Users className="h-3.5 w-3.5" /> {(g.members?.length || 0)}/{g.maxMembers || 10}
                      </button>
                    </td>
                    <td className="px-4 py-3 capitalize text-text-grey">{g.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEdit(g)} className="p-1.5 rounded border" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        {g.status !== "closed" && (
                          <button type="button" onClick={() => closeGroup(g._id)} className="p-1.5 rounded border text-amber-600" aria-label="Close"><Lock className="h-4 w-4" /></button>
                        )}
                        <button type="button" onClick={() => remove(g._id, g.title)} className="p-1.5 rounded border text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {formOpen && (
          <Modal title={editing ? "Edit group" : "Create group"} onClose={() => setFormOpen(false)}>
            <div className="space-y-3">
              {!editing && <Field label="Creator user ID (optional)" value={form.creatorId} onChange={(v) => setForm({ ...form, creatorId: v })} />}
              <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Destination *" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Departure *" value={form.departureDate} onChange={(v) => setForm({ ...form, departureDate: v })} type="date" />
                <Field label="Return" value={form.returnDate} onChange={(v) => setForm({ ...form, returnDate: v })} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max members" value={form.maxMembers} onChange={(v) => setForm({ ...form, maxMembers: v })} type="number" />
                <Field label="Cost/person (₹)" value={form.costPerPerson} onChange={(v) => setForm({ ...form, costPerPerson: v })} type="number" />
              </div>
              <Field label="Trip style" value={form.tripStyle} onChange={(v) => setForm({ ...form, tripStyle: v })} />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
              <div>
                <label className="text-xs font-medium text-text-grey">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 rounded-lg border px-3 py-2 text-sm">
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <span className="text-xs font-medium text-text-grey">Cover image</span>
                {form.coverImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.coverImage} alt="" className="mt-1 h-20 rounded-lg object-cover" />
                )}
                <label className="mt-1 block text-sm text-green-dark font-medium cursor-pointer">
                  + Upload cover
                  <input type="file" accept="image/*" className="hidden" onChange={uploadCover} />
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setFormOpen(false)} className="flex-1 py-2 rounded-lg border text-sm">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-green-dark text-white text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            </div>
          </Modal>
        )}

        {membersOpen && (
          <Modal title={`Members — ${membersOpen.title}`} onClose={() => setMembersOpen(null)}>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {(membersOpen.members || []).length === 0 ? (
                <p className="text-sm text-text-grey text-center py-4">No members</p>
              ) : (
                membersOpen.members!.map((m, i) => (
                  <li key={m.user?._id || i} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{m.user?.name || "—"}</p>
                      <p className="text-xs text-text-grey">{m.user?.email}</p>
                      {m.user?.phone && <p className="text-xs text-text-grey">{m.user.phone}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs capitalize text-text-grey">{m.role}</span>
                      {m.role !== "creator" && m.user?._id && (
                        <button
                          type="button"
                          onClick={() => removeMember(membersOpen._id, m.user!._id, m.user!.name)}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Modal>
        )}
      </div>
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
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
