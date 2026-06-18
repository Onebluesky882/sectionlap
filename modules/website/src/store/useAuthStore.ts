import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "student" | "teacher";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
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
      name: "sectionlap-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
