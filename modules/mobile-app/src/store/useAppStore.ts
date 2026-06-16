import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BookingRecord, CreateBookingResult, Section, User } from "../types";
import { mockSections, MOCK_STUDENT, MOCK_TEACHER } from "./mockData";

interface AppStore {
  sections: Section[];
  bookings: BookingRecord[];
  currentUser: User;
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  createBooking: (sectionId: string) => CreateBookingResult;
  payBooking: (bookingId: string) => void;
  failBooking: (bookingId: string) => void;
  retryBooking: (bookingId: string) => void;
  switchRole: () => void;
}

function isActive(b: BookingRecord) {
  return b.status !== "failed";
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sections: mockSections,
      bookings: [],
      currentUser: MOCK_STUDENT,

      addSection: (section) =>
        set((s) => ({ sections: [...s.sections, section] })),

      updateSection: (section) =>
        set((s) => ({
          sections: s.sections.map((x) => (x.id === section.id ? section : x)),
        })),

      createBooking: (sectionId) => {
        const state = get();
        const studentId = state.currentUser.id;
        const existing = state.bookings.find(
          (b) => b.sectionId === sectionId && b.studentId === studentId && isActive(b)
        );
        if (existing) return { booking: existing, error: "ALREADY_BOOKED" };

        const section = state.sections.find((s) => s.id === sectionId);
        const activeCount = state.bookings.filter(
          (b) => b.sectionId === sectionId && isActive(b)
        ).length;
        if (section && activeCount >= section.capacity)
          return { booking: null, error: "CAPACITY_FULL" };

        const booking: BookingRecord = {
          id: `booking-${sectionId}-${studentId}-${Date.now()}`,
          sectionId,
          studentId,
          status: "pending",
          bookedAt: new Date().toISOString(),
        };
        set({ bookings: [...state.bookings, booking] });
        return { booking, error: null };
      },

      payBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? { ...b, status: "paid", paidAt: new Date().toISOString() }
              : b
          ),
        })),

      failBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "failed" } : b
          ),
        })),

      retryBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId && b.status === "failed"
              ? { ...b, status: "pending", paidAt: undefined }
              : b
          ),
        })),

      switchRole: () =>
        set((s) => ({
          currentUser: s.currentUser.role === "teacher" ? MOCK_STUDENT : MOCK_TEACHER,
        })),
    }),
    {
      name: "sectionlap-store",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (_persisted, version) => {
        if (version < 2)
          return { sections: mockSections, bookings: [], currentUser: MOCK_STUDENT };
        return _persisted as AppStore;
      },
    }
  )
);
