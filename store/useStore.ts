import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

interface AppState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSearchTab: string;
  setActiveSearchTab: (tab: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  budgetFilter: string;
  setBudgetFilter: (filter: string) => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  cartItems: number;
  setCartItems: (count: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      activeSearchTab: "packages",
      setActiveSearchTab: (activeSearchTab) => set({ activeSearchTab }),
      activeFilter: "all",
      setActiveFilter: (activeFilter) => set({ activeFilter }),
      budgetFilter: "all",
      setBudgetFilter: (budgetFilter) => set({ budgetFilter }),
      isMobileNavOpen: false,
      setMobileNavOpen: (isMobileNavOpen) => set({ isMobileNavOpen }),
      cartItems: 0,
      setCartItems: (cartItems) => set({ cartItems }),
    }),
    {
      name: "xoxo-travels-store",
      partialize: (state) => ({
        activeSearchTab: state.activeSearchTab,
        activeFilter: state.activeFilter,
        budgetFilter: state.budgetFilter,
      }),
    }
  )
);
