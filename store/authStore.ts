import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  rewardPoints?: number;
  isVerified?: boolean;
  trustScore?: number;
  verificationStatus?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      hydrated: false,

      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          const { user, accessToken } = data.data;
          if (typeof window !== "undefined") localStorage.setItem("xoxo_token", accessToken);
          set({ user, token: accessToken, loading: false, hydrated: true });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const { data } = await authAPI.register(payload);
          const { user, accessToken } = data.data;
          if (typeof window !== "undefined") localStorage.setItem("xoxo_token", accessToken);
          set({ user, token: accessToken, loading: false, hydrated: true });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          /* ignore network errors on logout */
        }
        if (typeof window !== "undefined") localStorage.removeItem("xoxo_token");
        set({ user: null, token: null, hydrated: true });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data.data.user, hydrated: true });
        } catch {
          if (typeof window !== "undefined") localStorage.removeItem("xoxo_token");
          set({ user: null, token: null, hydrated: true });
        }
      },
    }),
    {
      name: "xoxo-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("xoxo_token", state.token);
        }
      },
    }
  )
);
