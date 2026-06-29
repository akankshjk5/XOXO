import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";
import { getUserRole } from "@/lib/auth-routing";

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
  role: string | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setHydrated: () => void;
}

function normalizeUser(user: AuthUser): AuthUser {
  return { ...user, role: getUserRole(user) };
}

function authSession(user: AuthUser | null, token: string | null) {
  const normalized = user ? normalizeUser(user) : null;
  return {
    user: normalized,
    token,
    role: normalized ? getUserRole(normalized) : null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      loading: false,
      hydrated: false,

      setUser: (user) => set(authSession(user, get().token)),
      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          const { user, accessToken } = data.data;
          const normalized = normalizeUser(user);
          if (typeof window !== "undefined") localStorage.setItem("xoxo_token", accessToken);
          set({ ...authSession(normalized, accessToken), loading: false, hydrated: true });
          return normalized;
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
          const normalized = normalizeUser(user);
          if (typeof window !== "undefined") localStorage.setItem("xoxo_token", accessToken);
          set({ ...authSession(normalized, accessToken), loading: false, hydrated: true });
          return normalized;
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
        set({ user: null, token: null, role: null, hydrated: true });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          const normalized = normalizeUser(data.data.user);
          set({ ...authSession(normalized, get().token), hydrated: true });
        } catch {
          if (typeof window !== "undefined") localStorage.removeItem("xoxo_token");
          set({ user: null, token: null, role: null, hydrated: true });
        }
      },
    }),
    {
      name: "xoxo-auth",
      partialize: (s) => ({ user: s.user, token: s.token, role: s.role }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("xoxo_token", state.token);
        }
        if (state?.user && !state.role) {
          state.role = getUserRole(state.user);
        }
      },
    }
  )
);
