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
  setToken,
  clearToken,
} from "../lib/api";

interface AppStore {
  sections: Section[];
  bookings: BookingRecord[];
  currentUser: User | null;
  token: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;

  loadSections: () => Promise<void>;
  addSection: (data: Omit<Section, "id" | "teacherId">) => Promise<void>;
  updateSection: (section: Section) => Promise<void>;

  loadBookings: () => Promise<void>;
  createBooking: (sectionId: string) => Promise<CreateBookingResult>;
  payBooking: (bookingId: string) => Promise<void>;
  failBooking: (bookingId: string) => Promise<void>;
  retryBooking: (bookingId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sections: [],
      bookings: [],
      currentUser: null,
      token: null,

      initialize: async () => {
        const { token } = get();
        if (!token) return;
        setToken(token);
        try {
          const user = await apiMe();
          if (!user) {
            clearToken();
            set({ token: null, currentUser: null });
            return;
          }
          set({ currentUser: user });
          await get().loadSections();
          await get().loadBookings();
        } catch {
          clearToken();
          set({ token: null, currentUser: null });
        }
      },

      login: async (email, password) => {
        const { token, user } = await apiSignin(email, password);
        setToken(token);
        set({ token, currentUser: user });
        await get().loadSections();
        await get().loadBookings();
      },

      signup: async (name, email, password, role) => {
        const { token, user } = await apiSignup(name, email, password, role);
        setToken(token);
        set({ token, currentUser: user });
        await get().loadSections();
        await get().loadBookings();
      },

      logout: async () => {
        try {
          await apiSignout();
        } finally {
          clearToken();
          set({ token: null, currentUser: null, bookings: [] });
        }
      },

      loadSections: async () => {
        const sections = await apiListSections();
        set({ sections });
      },

      addSection: async (data) => {
        const section = await apiCreateSection(data);
        set((state) => ({ sections: [...state.sections, section] }));
      },

      updateSection: async (section) => {
        const updated = await apiUpdateSection(section);
        set((state) => ({
          sections: state.sections.map((s) => (s.id === updated.id ? updated : s)),
        }));
      },

      loadBookings: async () => {
        const bookings = await apiListBookings();
        set({ bookings });
      },

      createBooking: async (sectionId) => {
        const result = await apiCreateBooking(sectionId);
        if (result.error === "ALREADY_BOOKED") {
          // Refresh bookings to get the existing one
          await get().loadBookings();
          const currentUser = get().currentUser;
          const existing = get().bookings.find(
            (b) =>
              b.sectionId === sectionId &&
              b.studentId === currentUser?.id &&
              b.status !== "failed"
          );
          return { booking: existing ?? null, error: "ALREADY_BOOKED" };
        }
        if (result.error === "CAPACITY_FULL") {
          return { booking: null, error: "CAPACITY_FULL" };
        }
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
    }),
    {
      name: "sectionlap-auth",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
