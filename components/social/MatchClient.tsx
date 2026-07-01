"use client";

import { useEffect, useState } from "react";
import { Users, Send, Check, X, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { matchAPI } from "@/lib/api";
import { VerifiedBadge, TrustScore } from "@/components/social/VerifiedBadge";
import { FriendActionButton } from "@/components/social/FriendActionButton";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { AnimatedTabs, AnimatedTabPanel } from "@/components/motion/AnimatedTabs";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { EmptyState, LoadingSkeleton } from "@/components/motion";
import { AnimatedButton } from "@/components/motion/AnimatedButton";
import { NearbyClient } from "@/components/social/NearbyClient";
import { SafetyDisclaimer } from "@/components/social/SafetyDisclaimer";

const INTERESTS = ["Adventure", "Culture", "Food", "Beaches", "Nightlife", "Photography", "Trekking", "Shopping"];

interface MatchCard {
  profile: { _id: string; destination: string; travelDateFrom: string; travelDateTo: string; interests?: string[] };
  matchScore: number;
  user: { _id: string; name: string; avatar?: string; isVerified?: boolean; trustScore?: number; bio?: string };
}

export function MatchClient() {
  const me = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"discover" | "nearby" | "profile" | "requests">("discover");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [requests, setRequests] = useState<{
    incoming: { _id: string; fromUser: MatchCard["user"]; matchScore: number; message?: string }[];
    outgoing: { _id: string; toUser: MatchCard["user"]; matchScore: number; status: string }[];
    accepted: { _id: string; fromUser: MatchCard["user"]; toUser: MatchCard["user"]; matchScore: number }[];
  } | null>(null);

  const [form, setForm] = useState({
    destination: "",
    travelDateFrom: "",
    travelDateTo: "",
    interests: [] as string[],
    lookingFor: "buddy",
    budget: "mid-range",
    bio: "",
  });

  useEffect(() => {
    matchAPI.getProfile().then(({ data }) => {
      if (data.data) {
        setForm({
          destination: data.data.destination || "",
          travelDateFrom: data.data.travelDateFrom?.slice(0, 10) || "",
          travelDateTo: data.data.travelDateTo?.slice(0, 10) || "",
          interests: data.data.interests || [],
          lookingFor: data.data.lookingFor || "buddy",
          budget: data.data.budget || "mid-range",
          bio: data.data.bio || "",
        });
      }
    }).catch(() => {});
  }, []);

  const loadDiscover = async () => {
    setLoading(true);
    try {
      const { data } = await matchAPI.discover();
      if (data.requiresProfile) {
        setMatches([]);
        setTab("profile");
        return;
      }
      setMatches(data.data);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Set up your profile first");
      setTab("profile");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    const { data } = await matchAPI.getRequests();
    setRequests(data.data);
  };

  useEffect(() => {
    if (tab === "discover") loadDiscover();
    if (tab === "requests") loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const saveProfile = async () => {
    try {
      await matchAPI.upsertProfile(form);
      toast.success("Profile saved! Finding matches…");
      setTab("discover");
    } catch {
      toast.error("Couldn't save profile");
    }
  };

  const sendRequest = async (toUserId: string) => {
    try {
      await matchAPI.sendRequest({ toUserId });
      toast.success("Request sent!");
      loadDiscover();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed");
    }
  };

  const respond = async (id: string, action: "accept" | "reject") => {
    await matchAPI.respond(id, action);
    toast.success(action === "accept" ? "Connected! 🎉" : "Declined");
    loadRequests();
  };

  const toggleInterest = (i: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  return (
    <div className="pt-[88px] max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-text-dark">Solo Traveler Matchmaking</h1>
        <p className="text-text-grey mt-1">Find travel buddies or discover nearby travellers by destination, dates & interests.</p>
      </div>

      <SafetyDisclaimer className="mb-6" />

      <AnimatedTabs
        tabs={[
          { id: "discover", label: "Matchmaking" },
          { id: "nearby", label: "Nearby Travellers" },
          { id: "profile", label: "My profile" },
          { id: "requests", label: "Requests" },
        ]}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
        className="mb-6"
      />

      <AnimatedTabPanel id="nearby" active={tab}>
        <NearbyClient embedded />
      </AnimatedTabPanel>

      <AnimatedTabPanel id="profile" active={tab}>
        <div className="max-w-lg mx-auto space-y-4 border border-[#EBEBEB] rounded-2xl p-6">
          <Field label="Destination" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} placeholder="e.g. Bali, Thailand" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="From" type="date" value={form.travelDateFrom} onChange={(v) => setForm({ ...form, travelDateFrom: v })} />
            <Field label="To" type="date" value={form.travelDateTo} onChange={(v) => setForm({ ...form, travelDateTo: v })} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)} className={`px-3 py-1 rounded-full text-xs font-medium border ${form.interests.includes(i) ? "bg-green-dark text-white border-green-dark" : "border-[#E0E0E0]"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="A bit about you…" className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 resize-none focus:border-green-dark outline-none" />
          <AnimatedButton className="w-full" onClick={saveProfile}>
            Save & find matches
          </AnimatedButton>
        </div>
      </AnimatedTabPanel>

      <AnimatedTabPanel id="discover" active={tab}>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="No matches yet"
            description="Update your destination, dates, and interests to find compatible travel buddies."
            action={
              <AnimatedButton size="sm" variant="secondary" onClick={() => setTab("profile")}>
                Update match profile
              </AnimatedButton>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {matches.map((m) => (
              <AnimatedCard key={m.user._id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-text-dark flex items-center gap-2">
                      {m.user.name}
                      {m.user.isVerified && <VerifiedBadge />}
                    </p>
                    <TrustScore score={m.user.trustScore} />
                  </div>
                  <span className="text-2xl font-black text-green-neon">{m.matchScore}%</span>
                </div>
                <p className="flex items-center gap-1 text-sm text-text-grey mb-2">
                  <MapPin className="h-3.5 w-3.5" /> {m.profile.destination}
                </p>
                <p className="text-xs text-text-grey mb-3">
                  {new Date(m.profile.travelDateFrom).toLocaleDateString()} – {new Date(m.profile.travelDateTo).toLocaleDateString()}
                </p>
                {m.user.bio && <p className="text-sm text-text-grey mb-3 line-clamp-2">{m.user.bio}</p>}
                <div className="flex flex-col gap-2">
                  <button onClick={() => sendRequest(m.user._id)} className="w-full py-2.5 rounded-full bg-green-neon text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-dark touch-target transition-colors">
                    <Send className="h-4 w-4" /> Connect
                  </button>
                  <FriendActionButton userId={m.user._id} userName={m.user.name} compact className="w-full justify-center" />
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </AnimatedTabPanel>

      <AnimatedTabPanel id="requests" active={tab}>
      {requests && (
        <div className="space-y-6 max-w-lg mx-auto">
          <Section title="Incoming">
            {requests.incoming.length === 0 ? (
              <EmptyState variant="compact" icon="📥" title="No incoming requests" description="When someone wants to connect, you'll see them here." />
            ) : requests.incoming.map((r) => (
              <div key={r._id} className="flex items-center justify-between border border-[#EBEBEB] rounded-xl p-4 mb-2">
                <div>
                  <p className="font-semibold">{r.fromUser.name} <span className="text-green-neon">{r.matchScore}%</span></p>
                  {r.message && <p className="text-xs text-text-grey">{r.message}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond(r._id, "accept")} aria-label="Accept match request" className="h-9 w-9 rounded-full bg-green-neon text-white flex items-center justify-center"><Check className="h-4 w-4" /></button>
                  <button onClick={() => respond(r._id, "reject")} aria-label="Decline match request" className="h-9 w-9 rounded-full border border-red-300 text-red-500 flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </Section>
          <Section title={`Connected (${requests.accepted.length})`}>
            {requests.accepted.length === 0 ? (
              <EmptyState variant="compact" icon="🤝" title="No connections yet" description="Accept match requests to start planning trips together." />
            ) : (
              <div className="space-y-2">
                {requests.accepted.map((r) => {
                  const buddy =
                    String(r.fromUser._id) === me?._id ? r.toUser : r.fromUser;
                  return (
                    <div
                      key={r._id}
                      className="flex items-center justify-between border border-[#EBEBEB] rounded-xl p-4"
                    >
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {buddy.name}
                          {buddy.isVerified && <VerifiedBadge className="!text-[10px]" />}
                          <span className="text-green-neon text-sm">{r.matchScore}%</span>
                        </p>
                        <Link
                          href={`/chat?peer=${buddy._id}`}
                          className="text-xs text-green-dark font-semibold hover:underline"
                        >
                          Message
                        </Link>
                      </div>
                      <FriendActionButton userId={buddy._id} userName={buddy.name} compact />
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      )}
      </AnimatedTabPanel>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="font-bold text-text-dark mb-2">{title}</h3>{children}</div>;
}
