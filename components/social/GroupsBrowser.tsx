"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, MapPin, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { groupsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  AnimatedButton,
  AnimatedCard,
  EmptyState,
  MotionModal,
  SkeletonCard,
  StaggerReveal,
  StaggerRevealItem,
} from "@/components/motion";

interface Group {
  _id: string;
  title: string;
  destination: string;
  departureDate: string;
  maxMembers: number;
  members: { user: { name?: string } }[];
  status: string;
  tripStyle?: string;
}

export function GroupsBrowser() {
  const user = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    maxMembers: 8,
    description: "",
    tripStyle: "adventure",
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await groupsAPI.list();
      setGroups(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!user) {
      toast.error("Please log in");
      return;
    }
    try {
      await groupsAPI.create(form);
      toast.success("Group created!");
      setShowCreate(false);
      load();
    } catch {
      toast.error("Couldn't create group");
    }
  };

  return (
    <div className="pt-[88px] container-x pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-dark tracking-tight">Group Travel</h1>
          <p className="text-text-grey mt-1">Join or create group trips with fellow adventurers.</p>
        </div>
        <AnimatedButton onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Create trip
        </AnimatedButton>
      </div>

      <MotionModal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto shadow-2xl">
          <h3 className="font-bold text-lg">New group trip</h3>
          <input
            placeholder="Trip title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-dark transition-colors"
          />
          <input
            placeholder="Destination"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-dark transition-colors"
          />
          <input
            type="date"
            value={form.departureDate}
            onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-green-dark transition-colors"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border rounded-xl px-4 py-2.5 resize-none outline-none focus:border-green-dark transition-colors"
          />
          <div className="flex gap-2 pt-2">
            <AnimatedButton variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton className="flex-1" onClick={create}>
              Create
            </AnimatedButton>
          </div>
        </div>
      </MotionModal>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No group trips yet"
          description="Create the first group adventure or check back soon."
          action={
            <AnimatedButton size="sm" onClick={() => setShowCreate(true)} className="mt-2">
              Create a trip
            </AnimatedButton>
          }
        />
      ) : (
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <StaggerRevealItem key={g._id}>
              <Link href={`/groups/${g._id}`} className="block">
                <AnimatedCard className="p-5 hover:border-green-dark/30">
                  <h3 className="font-bold text-text-dark line-clamp-1">{g.title}</h3>
                  <p className="flex items-center gap-1 text-sm text-text-grey mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {g.destination}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-text-grey mt-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(g.departureDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Users className="h-4 w-4" /> {g.members.length}/{g.maxMembers}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        g.status === "open" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                </AnimatedCard>
              </Link>
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
