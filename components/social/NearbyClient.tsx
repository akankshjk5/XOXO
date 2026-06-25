"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Loader2, Navigation, Shield, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { nearbyAPI } from "@/lib/api";
import { VerifiedBadge, TrustScore } from "@/components/social/VerifiedBadge";
import { FriendActionButton } from "@/components/social/FriendActionButton";
import { AnimatedButton, EmptyState, StaggerReveal, StaggerRevealItem } from "@/components/motion";
import { AnimatedCard } from "@/components/motion/AnimatedCard";

interface NearbyUser {
  user: { _id: string; name: string; avatar?: string; isVerified?: boolean; trustScore?: number; bio?: string; interests?: string[] };
  distanceKm: number;
}

export function NearbyClient() {
  const [settings, setSettings] = useState<{ locationVisible?: boolean; lastLatitude?: number; lastLongitude?: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    nearbyAPI.getSettings().then(({ data }) => setSettings(data.data)).catch(() => {});
  }, []);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          await nearbyAPI.updateLocation(lat, lng);
          setSettings((s) => ({ ...s, lastLatitude: lat, lastLongitude: lng }));
          toast.success("Location updated");
          if (settings?.locationVisible !== false) discover(lat, lng);
        } catch {
          toast.error("Couldn't update location");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLoading(false);
      }
    );
  };

  const discover = async (lat?: number, lng?: number) => {
    const useLat = lat ?? coords?.lat ?? settings?.lastLatitude;
    const useLng = lng ?? coords?.lng ?? settings?.lastLongitude;
    if (useLat == null || useLng == null) {
      toast.error("Share your location first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await nearbyAPI.discover({ lat: useLat, lng: useLng, radiusKm, verifiedOnly });
      setNearby(data.data);
    } catch {
      toast.error("Couldn't find nearby travelers");
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async () => {
    const next = !settings?.locationVisible;
    try {
      await nearbyAPI.setPrivacy(next);
      setSettings((s) => ({ ...s, locationVisible: next }));
      toast.success(next ? "You're visible to nearby travelers" : "Location hidden");
    } catch {
      toast.error("Couldn't update privacy");
    }
  };

  return (
    <div className="pt-[88px] max-w-[900px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-text-dark">Travelers Nearby</h1>
        <p className="text-text-grey mt-1">Discover fellow explorers around you — with full privacy control.</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <AnimatedButton onClick={shareLocation} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Update my location
        </AnimatedButton>
        <AnimatedButton variant="outline" onClick={togglePrivacy}>
          {settings?.locationVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {settings?.locationVisible ? "Visible" : "Hidden"}
        </AnimatedButton>
        <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E0E0E0] text-sm cursor-pointer">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-green-dark" />
          <Shield className="h-4 w-4" /> Verified only
        </label>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <label className="text-sm font-semibold mb-1 block">Radius: {radiusKm} km</label>
        <input type="range" min={5} max={200} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-full accent-green-dark" />
        <AnimatedButton variant="secondary" className="w-full mt-3" onClick={() => discover()}>
          Search nearby
        </AnimatedButton>
      </div>

      {nearby.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No travelers nearby"
          description="Share your location and try increasing the search radius."
        />
      ) : (
        <StaggerReveal className="space-y-3">
          {nearby.map((n) => (
            <StaggerRevealItem key={n.user._id}>
              <AnimatedCard className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-text-dark flex items-center gap-2">
                  {n.user.name}
                  {n.user.isVerified && <VerifiedBadge />}
                </p>
                <TrustScore score={n.user.trustScore} />
                {n.user.bio && <p className="text-xs text-text-grey mt-1 line-clamp-1">{n.user.bio}</p>}
              </div>
              <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-2">
                <p className="font-bold text-green-dark flex items-center gap-1"><MapPin className="h-4 w-4" /> {n.distanceKm} km</p>
                <Link href={`/chat?peer=${n.user._id}`} className="text-xs text-green-dark font-semibold hover:underline">Message</Link>
                <FriendActionButton userId={n.user._id} userName={n.user.name} compact />
              </div>
              </AnimatedCard>
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
