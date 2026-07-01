"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

function syncToken() {
  const token = useAuthStore.getState().token;
  if (token && typeof window !== "undefined") {
    localStorage.setItem("xoxo_token", token);
  }
}

interface WishlistContextValue {
  packageIds: Set<string>;
  destinationIds: Set<string>;
  ready: boolean;
  togglePackage: (packageId: string) => Promise<void>;
  toggleDestination: (destinationId: string) => Promise<void>;
  isPackageSaved: (id: string) => boolean;
  isDestinationSaved: (id: string) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [packageIds, setPackageIds] = useState<Set<string>>(new Set());
  const [destinationIds, setDestinationIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setPackageIds(new Set());
      setDestinationIds(new Set());
      setReady(true);
      return;
    }
    syncToken();
    try {
      const [pkgRes, destRes] = await Promise.all([
        usersAPI.getWishlist(),
        usersAPI.getDestinationWishlist(),
      ]);
      setPackageIds(new Set((pkgRes.data.data || []).map((p: { _id: string }) => String(p._id))));
      setDestinationIds(
        new Set((destRes.data.data || []).map((d: { _id: string }) => String(d._id)))
      );
    } catch {
      /* silent on load */
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    setReady(false);
    refresh();
  }, [hydrated, user, refresh]);

  const togglePackage = useCallback(
    async (packageId: string) => {
      if (!user) {
        toast.error("Please log in to save to wishlist.");
        return;
      }
      if (!OBJECT_ID_RE.test(packageId)) {
        toast.error("This item cannot be saved.");
        return;
      }
      syncToken();
      const wasSaved = packageIds.has(packageId);
      setPackageIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(packageId);
        else next.add(packageId);
        return next;
      });
      try {
        const { data } = await usersAPI.toggleWishlist(packageId);
        const added = Boolean(data.added);
        setPackageIds((prev) => {
          const next = new Set(prev);
          if (added) next.add(packageId);
          else next.delete(packageId);
          return next;
        });
        toast.success(added ? "Saved successfully" : "Removed from wishlist");
      } catch (err: unknown) {
        setPackageIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(packageId);
          else next.delete(packageId);
          return next;
        });
        const status = (err as { response?: { status?: number; data?: { message?: string } } })
          ?.response?.status;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        if (status === 401) toast.error("Please log in again.");
        else toast.error(msg || "Couldn't update wishlist.");
      }
    },
    [user, packageIds]
  );

  const toggleDestination = useCallback(
    async (destinationId: string) => {
      if (!user) {
        toast.error("Please log in to save to wishlist.");
        return;
      }
      if (!OBJECT_ID_RE.test(destinationId)) {
        toast.error("This item cannot be saved.");
        return;
      }
      syncToken();
      const wasSaved = destinationIds.has(destinationId);
      setDestinationIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(destinationId);
        else next.add(destinationId);
        return next;
      });
      try {
        const { data } = await usersAPI.toggleDestinationWishlist(destinationId);
        const added = Boolean(data.added);
        setDestinationIds((prev) => {
          const next = new Set(prev);
          if (added) next.add(destinationId);
          else next.delete(destinationId);
          return next;
        });
        toast.success(added ? "Saved successfully" : "Removed from wishlist");
      } catch (err: unknown) {
        setDestinationIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(destinationId);
          else next.delete(destinationId);
          return next;
        });
        const status = (err as { response?: { status?: number } })?.response?.status;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        if (status === 401) toast.error("Please log in again.");
        else toast.error(msg || "Couldn't update wishlist.");
      }
    },
    [user, destinationIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        packageIds,
        destinationIds,
        ready,
        togglePackage,
        toggleDestination,
        isPackageSaved: (id) => packageIds.has(id),
        isDestinationSaved: (id) => destinationIds.has(id),
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
