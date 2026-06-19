import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
};

type AdminAuthStore = {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AdminUser, token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
};

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user, token) => set({ user, token, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "sectionlap-admin-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
