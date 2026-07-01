"use client";

import { useEffect, useState } from "react";
import { Search, X, MapPin, Star, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { guidesAPI, chatAPI } from "@/lib/api";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";

export interface GuideOption {
  _id?: string;
  city?: string;
  country?: string;
  languages?: string[];
  rating?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  user?: { _id?: string; name?: string; avatar?: string };
}

export interface RoomGuide {
  _id: string;
  guideUser?: { _id: string; name?: string };
  guideProfile?: GuideOption;
}

interface InviteGuidePanelProps {
  peerId: string;
  guides: RoomGuide[];
  onGuidesChange: (guides: RoomGuide[]) => void;
  onSystemMessage: (content: string) => void;
}

export function InviteGuidePanel({ peerId, guides, onGuidesChange, onSystemMessage }: InviteGuidePanelProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<GuideOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params: Record<string, string> = { verified: "true" };
    if (search) params.q = search;
    guidesAPI
      .getAll(params)
      .then((res) => setOptions((res.data.data || []).filter((g: GuideOption) => g.isVerified)))
      .catch(() => toast.error("Could not load guides"))
      .finally(() => setLoading(false));
  }, [open, search]);

  const invite = async (guideId: string) => {
    if (!guideId) return;
    setInviting(guideId);
    try {
      const { data } = await chatAPI.inviteGuide(peerId, guideId);
      onGuidesChange([...guides, data.data]);
      onSystemMessage(data.data?.guideProfile?.user?.name ? `${data.data.guideProfile.user.name} joined` : "Guide joined");
      toast.success("Guide invited to conversation");
      setOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not invite guide");
    } finally {
      setInviting(null);
    }
  };

  const remove = async (guideUserId: string) => {
    try {
      const { data } = await chatAPI.removeGuide(peerId, guideUserId);
      onGuidesChange(guides.filter((g) => String(g.guideUser?._id) !== String(guideUserId)));
      if (data.data?.content) onSystemMessage(data.data.content);
      toast.success("Guide removed");
    } catch {
      toast.error("Could not remove guide");
    }
  };

  return (
    <div className="border-b border-[#EBEBEB] bg-off-white/60 px-4 py-2 shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        {guides.map((g) => {
          const profile = g.guideProfile;
          const name = profile?.user?.name || g.guideUser?.name || "Guide";
          return (
            <div
              key={g._id}
              className="flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-white pl-2 pr-1 py-1 text-xs shadow-sm"
            >
              <span className="font-semibold text-text-dark">{name}</span>
              {profile?.isVerified && <VerifiedBadge />}
              {profile?.country && (
                <span className="text-text-grey flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" /> {profile.country}
                </span>
              )}
              {profile?.rating ? (
                <span className="text-text-grey flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {profile.rating.toFixed(1)}
                </span>
              ) : null}
              <span className={profile?.isAvailable !== false ? "text-green-dark" : "text-amber-600"}>
                {profile?.isAvailable !== false ? "Available" : "Busy"}
              </span>
              <button
                type="button"
                onClick={() => g.guideUser?._id && remove(g.guideUser._id)}
                className="rounded-full p-1 hover:bg-red-50 text-text-grey hover:text-red-500"
                aria-label={`Remove ${name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-dark/30 bg-white px-3 py-1.5 text-xs font-semibold text-green-dark hover:bg-green-dark/5 transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Guide
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
              <h3 className="font-bold text-text-dark">Invite Local Guide</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b border-[#EBEBEB]">
              <div className="flex items-center gap-2 rounded-full border border-[#E0E0E0] px-3 py-2">
                <Search className="h-4 w-4 text-text-grey" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city or country…"
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-text-grey" />
                </div>
              ) : options.length === 0 ? (
                <p className="text-sm text-text-grey text-center py-8">No verified guides found</p>
              ) : (
                options.map((g) => (
                  <button
                    key={g._id}
                    type="button"
                    disabled={inviting === g._id}
                    onClick={() => g._id && invite(g._id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-off-white text-left disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-text-dark flex items-center gap-1">
                        {g.user?.name || "Guide"}
                        {g.isVerified && <VerifiedBadge className="!text-[10px]" />}
                      </p>
                      <p className="text-xs text-text-grey">
                        {g.city}
                        {g.country ? `, ${g.country}` : ""}
                      </p>
                      {g.languages?.length ? (
                        <p className="text-xs text-text-grey mt-0.5">{g.languages.join(" · ")}</p>
                      ) : null}
                      <p className="text-xs mt-1">
                        {g.isAvailable !== false ? (
                          <span className="text-green-dark font-medium">Available</span>
                        ) : (
                          <span className="text-amber-600">Unavailable</span>
                        )}
                        {g.rating ? (
                          <span className="text-text-grey ml-2">★ {g.rating.toFixed(1)}</span>
                        ) : null}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
