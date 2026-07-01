"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

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
    try {
      const [pkgRes, destRes] = await Promise.all([
        usersAPI.getWishlist(),
        usersAPI.getDestinationWishlist(),
      ]);
      setPackageIds(new Set((pkgRes.data.data || []).map((p: { _id: string }) => p._id)));
      setDestinationIds(
        new Set((destRes.data.data || []).map((d: { _id: string }) => String(d._id)))
      );
    } catch {
      /* ignore */
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
      try {
        const { data } = await usersAPI.toggleWishlist(packageId);
        const added = data.added as boolean;
        setPackageIds((prev) => {
          const next = new Set(prev);
          if (added) next.add(packageId);
          else next.delete(packageId);
          return next;
        });
        toast.success(added ? "Added to Wishlist" : "Removed from Wishlist");
      } catch {
        toast.error("Couldn't update wishlist.");
      }
    },
    [user]
  );

  const toggleDestination = useCallback(
    async (destinationId: string) => {
      if (!user) {
        toast.error("Please log in to save to wishlist.");
        return;
      }
      try {
        const { data } = await usersAPI.toggleDestinationWishlist(destinationId);
        const added = data.added as boolean;
        setDestinationIds((prev) => {
          const next = new Set(prev);
          if (added) next.add(destinationId);
          else next.delete(destinationId);
          return next;
        });
        toast.success(added ? "Added to Wishlist" : "Removed from Wishlist");
      } catch {
        toast.error("Couldn't update wishlist.");
      }
    },
    [user]
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
