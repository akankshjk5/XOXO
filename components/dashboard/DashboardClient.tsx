"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Heart,
  Map,
  Gift,
  User as UserIcon,
  Loader2,
  Trash2,
  Wallet as WalletIcon,
  Copy,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingsAPI, usersAPI, itinerariesAPI, walletAPI, uploadAPI } from "@/lib/api";
import { isValidPhoneNumber } from "@/lib/phone";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_PACKAGE_IMAGE } from "@/lib/images";
import { CountUp } from "@/components/motion/CountUp";
import { EmptyState } from "@/components/motion/EmptyState";
import { DataLoadError } from "@/components/ui/DataLoadError";
import { useAuthStore } from "@/store/authStore";

type Tab = "overview" | "bookings" | "wishlist" | "itineraries" | "wallet" | "profile";

interface WalletData {
  walletBalance: number;
  rewardPoints: number;
  referralCode: string;
  transactions: {
    _id: string;
    kind: string;
    direction: string;
    amount: number;
    reason?: string;
    createdAt: string;
  }[];
}

interface Booking {
  _id: string;
  bookingRef: string;
  status: string;
  paymentStatus: string;
  travelDate?: string;
  numTravelers: number;
  totalAmount: number;
  package?: { _id: string; title: string; images?: string[] };
}
interface WishItem {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  durationDays: number;
}
interface Itin {
  _id: string;
  destination: string;
  totalDays?: number;
  estimatedBudget?: string;
  createdAt: string;
}

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "My Bookings", icon: Briefcase },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "itineraries", label: "Saved Itineraries", icon: Map },
  { id: "wallet", label: "Wallet & Rewards", icon: WalletIcon },
  { id: "profile", label: "Profile", icon: UserIcon },
];

export function DashboardClient() {
  const { user, setUser, fetchMe } = useAuthStore();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [itineraries, setItineraries] = useState<Itin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: "",
    nationality: "",
    bio: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [redeemAmt, setRedeemAmt] = useState("");
  const [refCode, setRefCode] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!user) return;
    setProfile((p) => ({
      ...p,
      name: user.name || p.name,
      phone: user.phone || user.phoneNumber || p.phone,
    }));
  }, [user]);

  useEffect(() => {
    const requested = searchParams?.get("tab");
    if (requested && NAV.some((n) => n.id === requested)) {
      setTab(requested as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (tab !== "wallet" || wallet) return;
    walletAPI
      .get()
      .then(({ data }) => setWallet(data.data))
      .catch(() => {});
  }, [tab, wallet]);

  const redeem = async () => {
    const points = Math.floor(Number(redeemAmt));
    if (!points || points <= 0) {
      toast.error("Enter points to redeem.");
      return;
    }
    try {
      const { data } = await walletAPI.redeem(points);
      setWallet((w) => (w ? { ...w, walletBalance: data.data.walletBalance, rewardPoints: data.data.rewardPoints } : w));
      setRedeemAmt("");
      toast.success("Points redeemed to wallet!");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Couldn't redeem.");
    }
  };

  const applyRef = async () => {
    if (!refCode.trim()) return;
    try {
      const { data } = await walletAPI.applyReferral(refCode.trim());
      setWallet((w) => (w ? { ...w, walletBalance: data.data.walletBalance } : w));
      setRefCode("");
      toast.success(data.message || "Referral applied!");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid code.");
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { data } = await uploadAPI.image(file);
      const { data: updated } = await usersAPI.updateProfile({ avatar: data.url });
      setUser(updated.data);
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Couldn't upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [b, w, i] = await Promise.all([
        bookingsAPI.getMy(),
        usersAPI.getWishlist(),
        itinerariesAPI.getMy(),
      ]);
      setBookings(b.data.data);
      setWishlist(w.data.data);
      setItineraries(i.data.data);
    } catch {
      setLoadError("Couldn't load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      await bookingsAPI.cancel(id);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Couldn't cancel booking.");
    }
  };

  const removeWish = async (packageId: string) => {
    try {
      await usersAPI.toggleWishlist(packageId);
      setWishlist((prev) => prev.filter((w) => w._id !== packageId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Couldn't update wishlist.");
    }
  };

  const removeItin = async (id: string) => {
    try {
      await itinerariesAPI.remove(id);
      setItineraries((prev) => prev.filter((x) => x._id !== id));
      toast.success("Itinerary deleted");
    } catch {
      toast.error("Couldn't delete itinerary.");
    }
  };

  const saveProfile = async () => {
    if (profile.phone && !isValidPhoneNumber(profile.phone)) {
      toast.error("Enter a valid phone number (at least 10 digits).");
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await usersAPI.updateProfile(profile);
      setUser(data.data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Couldn't update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const statusColor = (s: string) =>
    s === "confirmed"
      ? "bg-green-100 text-green-700"
      : s === "cancelled"
      ? "bg-red-100 text-red-600"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="pt-[88px] max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center gap-4 mb-8">
        <label className="relative h-14 w-14 rounded-full bg-green-dark text-white flex items-center justify-center text-xl font-bold overflow-hidden cursor-pointer group shrink-0">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </label>
        <div>
          <h1 className="text-2xl font-black text-text-dark">Hi, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-text-grey text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === n.id ? "bg-green-dark text-white" : "text-text-grey hover:bg-off-white"
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <div>
          {loadError && !loading ? (
            <DataLoadError message={loadError} onRetry={loadDashboard} className="mb-6" />
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 text-text-grey py-12">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard label="Bookings" value={String(bookings.length)} icon={Briefcase} />
                  <StatCard label="Wishlist" value={String(wishlist.length)} icon={Heart} />
                  <div className="rounded-2xl p-5 bg-gradient-to-br from-green-dark to-green-neon text-white">
                    <Gift className="h-6 w-6 mb-3" />
                    <p className="text-3xl font-black">
                      <CountUp end={user?.rewardPoints ?? 0} />
                    </p>
                    <p className="text-sm opacity-90">XOXO Reward Points</p>
                  </div>
                </div>
              )}

              {tab === "bookings" && (
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <Empty text="No bookings yet" description="When you book a package, your trips will appear here." cta="Browse packages" href="/packages" />
                  ) : (
                    bookings.map((b) => (
                      <div key={b._id} className="flex gap-4 border border-[#EBEBEB] rounded-2xl p-4">
                        <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 bg-off-white">
                          <Image
                            src={b.package?.images?.[0] || DEFAULT_PACKAGE_IMAGE}
                            alt={b.package?.title || "Package"}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-text-dark line-clamp-1">
                              {b.package?.title || "Package"}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-grey mt-0.5">Ref: {b.bookingRef}</p>
                          <p className="text-xs text-text-grey">
                            {b.travelDate ? new Date(b.travelDate).toLocaleDateString() : "—"} · {b.numTravelers} pax
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-green-dark">{formatPrice(b.totalAmount)}</span>
                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => cancelBooking(b._id)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "wishlist" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Empty text="Your wishlist is empty" description="Save packages you love and book them when you're ready." cta="Explore packages" href="/packages" />
                    </div>
                  ) : (
                    wishlist.map((w) => (
                      <div key={w._id} className="rounded-2xl overflow-hidden border border-[#EBEBEB] group">
                        <Link href={`/packages/${w._id}`} className="block relative h-32">
                          <Image
                            src={w.images?.[0] || DEFAULT_PACKAGE_IMAGE}
                            alt={w.title}
                            fill
                            sizes="33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <div className="p-3">
                          <p className="text-sm font-semibold line-clamp-1">{w.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-bold text-green-dark">{formatPrice(w.pricePerPerson)}</span>
                            <button onClick={() => removeWish(w._id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "itineraries" && (
                <div className="space-y-3">
                  {itineraries.length === 0 ? (
                    <Empty text="No saved itineraries" description="Use the AI Concierge to build a trip plan and save it to your dashboard." cta="✨ FREE AI Planner" href="/concierge" />
                  ) : (
                    itineraries.map((it) => (
                      <div key={it._id} className="flex items-center justify-between border border-[#EBEBEB] rounded-2xl p-4">
                        <div>
                          <p className="font-semibold text-text-dark">{it.destination}</p>
                          <p className="text-xs text-text-grey">
                            {it.totalDays ? `${it.totalDays} days` : ""} {it.estimatedBudget ? `· ${it.estimatedBudget}` : ""}
                          </p>
                        </div>
                        <button onClick={() => removeItin(it._id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "wallet" && (
                <div className="space-y-6">
                  {!wallet ? (
                    <div className="flex items-center gap-2 text-text-grey">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading wallet…
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-green-dark to-green-neon text-white">
                          <WalletIcon className="h-6 w-6 mb-3" />
                          <p className="text-3xl font-black">{formatPrice(wallet.walletBalance)}</p>
                          <p className="text-sm opacity-90">Wallet balance</p>
                        </div>
                        <div className="rounded-2xl p-5 border border-[#EBEBEB]">
                          <Gift className="h-6 w-6 text-green-dark mb-3" />
                          <p className="text-3xl font-black text-text-dark">{wallet.rewardPoints}</p>
                          <p className="text-sm text-text-grey">Reward points (1 pt = ₹1)</p>
                        </div>
                      </div>

                      {/* Redeem */}
                      <div className="border border-[#EBEBEB] rounded-2xl p-5">
                        <h4 className="font-bold text-text-dark mb-2">Redeem points to wallet</h4>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={redeemAmt}
                            onChange={(e) => setRedeemAmt(e.target.value)}
                            placeholder="Points"
                            className="flex-1 border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
                          />
                          <button onClick={redeem} className="px-5 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors">
                            Redeem
                          </button>
                        </div>
                      </div>

                      {/* Referral */}
                      <div className="border border-[#EBEBEB] rounded-2xl p-5">
                        <h4 className="font-bold text-text-dark mb-1">Refer & earn</h4>
                        <p className="text-sm text-text-grey mb-3">Share your code — you both get ₹500 wallet credit.</p>
                        <div className="flex items-center gap-2 mb-3">
                          <code className="flex-1 bg-off-white rounded-xl px-4 py-2.5 font-bold tracking-wider text-green-dark">
                            {wallet.referralCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wallet.referralCode);
                              toast.success("Code copied!");
                            }}
                            className="h-10 w-10 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:border-green-dark"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={refCode}
                            onChange={(e) => setRefCode(e.target.value)}
                            placeholder="Have a friend's code? Enter it"
                            className="flex-1 border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none uppercase"
                          />
                          <button onClick={applyRef} className="px-5 py-2.5 rounded-full border border-green-dark text-green-dark font-semibold hover:bg-green-dark hover:text-white transition-colors">
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Ledger */}
                      <div>
                        <h4 className="font-bold text-text-dark mb-2">Recent transactions</h4>
                        {wallet.transactions.length === 0 ? (
                          <EmptyState variant="compact" icon="💳" title="No transactions yet" description="Rewards and wallet activity will show up here." />
                        ) : (
                          <div className="space-y-2">
                            {wallet.transactions.map((t) => (
                              <div key={t._id} className="flex items-center justify-between border border-[#EBEBEB] rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-text-dark capitalize">{t.reason || t.kind}</p>
                                  <p className="text-xs text-text-grey">{new Date(t.createdAt).toLocaleString()}</p>
                                </div>
                                <span className={`font-bold text-sm ${t.direction === "credit" ? "text-green-dark" : "text-red-500"}`}>
                                  {t.direction === "credit" ? "+" : "−"}
                                  {t.kind === "wallet" ? formatPrice(t.amount) : `${t.amount} pts`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "profile" && (
                <div className="max-w-md space-y-4">
                  <Field label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                  <Field label="Phone Number" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} type="tel" placeholder="+91 98765 43210" />
                  <Field label="Nationality" value={profile.nationality} onChange={(v) => setProfile({ ...profile, nationality: v })} />
                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-1.5 block">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl p-5 border border-[#EBEBEB] bg-white">
      <Icon className="h-6 w-6 text-green-dark mb-3" />
      <p className="text-3xl font-black text-text-dark">{value}</p>
      <p className="text-sm text-text-grey">{label}</p>
    </div>
  );
}

function Empty({ text, description, cta, href }: { text: string; description?: string; cta: string; href: string }) {
  return <EmptyState title={text} description={description} cta={cta} href={href} icon="📋" />;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-text-dark mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
      />
    </div>
  );
}
