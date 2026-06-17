import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingRecord, CreateBookingResult, Section, User, UserRole } from "../types";
import {
  apiSignin,
  apiSignup,
  apiSignout,
  apiMe,
  apiListSections,
  apiCreateSection,
  apiUpdateSection,
  apiListBookings,
  apiCreateBooking,
  apiPayBooking,
  apiFailBooking,
  apiRetryBooking,
  apiCancelBooking,
  setToken,
  clearToken,
  setUserName,
  clearUserName,
} from "../lib/api";

interface AppStore {
  // Data
  sections: Section[];
  bookings: BookingRecord[];
  currentUser: User | null;
  token: string | null;
  // Auth global state
  isAuthLoading: boolean;
  authError: string | null;
  // Section filter
  categoryFilter: string;

  // Auth
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  // Sections
  loadSections: (category?: string) => Promise<void>;
  addSection: (data: Omit<Section, "id" | "teacherId" | "teacher">) => Promise<void>;
  updateSection: (section: Section) => Promise<void>;
  setCategoryFilter: (category: string) => void;

  // Bookings
  loadBookings: () => Promise<void>;
  createBooking: (sectionId: string) => Promise<CreateBookingResult>;
  payBooking: (bookingId: string) => Promise<void>;
  failBooking: (bookingId: string) => Promise<void>;
  retryBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sections: [],
      bookings: [],
      currentUser: null,
      token: null,
      isAuthLoading: false,
      authError: null,
      categoryFilter: "",

      clearAuthError: () => set({ authError: null }),

      initialize: async () => {
        const { token } = get();
        if (!token) return;
        set({ isAuthLoading: true });
        setToken(token);
        try {
          const user = await apiMe();
          if (!user) {
            clearToken();
            clearUserName();
            set({ token: null, currentUser: null });
            return;
          }
          setUserName(user.name);
          set({ currentUser: user });
          await get().loadSections();
          await get().loadBookings();
        } catch {
          clearToken();
          clearUserName();
          set({ token: null, currentUser: null });
        } finally {
          set({ isAuthLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isAuthLoading: true, authError: null });
        try {
          const { token, user } = await apiSignin(email, password);
          setToken(token);
          setUserName(user.name);
          set({ token, currentUser: user });
          await get().loadSections();
          await get().loadBookings();
        } catch (err) {
          set({ authError: err instanceof Error ? err.message : "Login failed" });
          throw err;
        } finally {
          set({ isAuthLoading: false });
        }
      },

      signup: async (name, email, password, role) => {
        set({ isAuthLoading: true, authError: null });
        try {
          const { token, user } = await apiSignup(name, email, password, role);
          setToken(token);
          setUserName(user.name);
          set({ token, currentUser: user });
          await get().loadSections();
          await get().loadBookings();
        } catch (err) {
          set({ authError: err instanceof Error ? err.message : "Signup failed" });
          throw err;
        } finally {
          set({ isAuthLoading: false });
        }
      },

      logout: async () => {
        try {
          await apiSignout();
        } finally {
          clearToken();
          clearUserName();
          set({ token: null, currentUser: null, bookings: [], categoryFilter: "" });
        }
      },

      loadSections: async (category?: string) => {
        const cat = category ?? get().categoryFilter;
        const sections = await apiListSections(cat || undefined);
        set({ sections });
      },

      addSection: async (data) => {
        const section = await apiCreateSection(data);
        set((state) => ({ sections: [section, ...state.sections] }));
      },

      updateSection: async (section) => {
        const updated = await apiUpdateSection(section);
        set((state) => ({
          sections: state.sections.map((s) => (s.id === updated.id ? updated : s)),
        }));
      },

      setCategoryFilter: (category) => {
        set({ categoryFilter: category });
        get().loadSections(category);
      },

      loadBookings: async () => {
        const bookings = await apiListBookings();
        set({ bookings });
      },

      createBooking: async (sectionId) => {
        const result = await apiCreateBooking(sectionId);
        if (result.error === "ALREADY_BOOKED") {
          await get().loadBookings();
          const existing = get().bookings.find(
            (b) => b.sectionId === sectionId && b.studentId === get().currentUser?.id && b.status !== "failed"
          );
          return { booking: existing ?? null, error: "ALREADY_BOOKED" };
        }
        if (result.error === "CAPACITY_FULL") return { booking: null, error: "CAPACITY_FULL" };
        if (result.booking) {
          set((state) => ({ bookings: [...state.bookings, result.booking!] }));
        }
        return result;
      },

      payBooking: async (bookingId) => {
        const updated = await apiPayBooking(bookingId);
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)),
        }));
      },

      failBooking: async (bookingId) => {
        const updated = await apiFailBooking(bookingId);
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)),
        }));
      },

      retryBooking: async (bookingId) => {
        const updated = await apiRetryBooking(bookingId);
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)),
        }));
      },

      cancelBooking: async (bookingId) => {
        const updated = await apiCancelBooking(bookingId);
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)),
        }));
      },
    }),
    {
      name: "sectionlap-auth",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
