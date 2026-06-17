import { create } from "zustand";
import type { BookingRecord, CreateBookingResult, Section, User, UserRole } from "../types";
import {
  loadTokenCache,
  getCachedToken,
  setToken,
  clearToken,
  setUserName,
  clearUserName,
} from "../lib/api";
import * as authService from "../services/authService";
import * as sectionService from "../services/sectionService";
import * as bookingService from "../services/bookingService";

interface AppStore {
  sections: Section[];
  bookings: BookingRecord[];
  currentUser: User | null;
  isAuthLoading: boolean;
  authError: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  loadSections: () => Promise<void>;
  addSection: (data: Omit<Section, "id" | "teacherId" | "teacher">) => Promise<void>;
  updateSection: (section: Section) => Promise<void>;

  loadBookings: () => Promise<void>;
  createBooking: (sectionId: string) => Promise<CreateBookingResult>;
  payBooking: (bookingId: string) => Promise<void>;
  failBooking: (bookingId: string) => Promise<void>;
  retryBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  sections: [],
  bookings: [],
  currentUser: null,
  isAuthLoading: false,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  initialize: async () => {
    await loadTokenCache();
    const token = getCachedToken();
    if (!token) return;
    set({ isAuthLoading: true });
    try {
      const user = await authService.getMe();
      if (!user) {
        await clearToken();
        await clearUserName();
        set({ currentUser: null });
        return;
      }
      await setUserName(user.name);
      set({ currentUser: user });
      await get().loadSections();
      await get().loadBookings();
    } catch {
      await clearToken();
      await clearUserName();
      set({ currentUser: null });
    } finally {
      set({ isAuthLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const { token, user } = await authService.login(email, password);
      await setToken(token);
      await setUserName(user.name);
      set({ currentUser: user });
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
      const { token, user } = await authService.signup(name, email, password, role);
      await setToken(token);
      await setUserName(user.name);
      set({ currentUser: user });
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
      await authService.logout();
    } finally {
      await clearToken();
      await clearUserName();
      set({ currentUser: null, sections: [], bookings: [] });
    }
  },

  loadSections: async () => {
    const sections = await sectionService.listSections();
    set({ sections });
  },

  addSection: async (data) => {
    const section = await sectionService.createSection(data);
    set((s) => ({ sections: [section, ...s.sections] }));
  },

  updateSection: async (section) => {
    const updated = await sectionService.updateSection(section);
    set((s) => ({
      sections: s.sections.map((x) => (x.id === updated.id ? updated : x)),
    }));
  },

  loadBookings: async () => {
    const bookings = await bookingService.listBookings();
    set({ bookings });
  },

  createBooking: async (sectionId) => {
    const result = await bookingService.createBooking(sectionId);
    if (result.error === "ALREADY_BOOKED") {
      await get().loadBookings();
      const existing = get().bookings.find(
        (b) =>
          b.sectionId === sectionId &&
          b.studentId === get().currentUser?.id &&
          b.status !== "failed"
      );
      return { booking: existing ?? null, error: "ALREADY_BOOKED" };
    }
    if (result.error === "CAPACITY_FULL") return { booking: null, error: "CAPACITY_FULL" };
    if (result.booking) {
      set((s) => ({ bookings: [...s.bookings, result.booking!] }));
    }
    return result;
  },

  payBooking: async (bookingId) => {
    const updated = await bookingService.payBooking(bookingId);
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === updated.id ? updated : b)),
    }));
  },

  failBooking: async (bookingId) => {
    const updated = await bookingService.failBooking(bookingId);
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === updated.id ? updated : b)),
    }));
  },

  retryBooking: async (bookingId) => {
    const updated = await bookingService.retryBooking(bookingId);
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === updated.id ? updated : b)),
    }));
  },

  cancelBooking: async (bookingId) => {
    const updated = await bookingService.cancelBooking(bookingId);
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === updated.id ? updated : b)),
    }));
  },
}));
