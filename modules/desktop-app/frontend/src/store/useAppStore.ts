import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingRecord, Section } from "../types";
import { mockSections } from "../data/mockSections";

interface AppStore {
  sections: Section[];
  bookings: BookingRecord[];
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  createBooking: (sectionId: string) => void;
  payBooking: (sectionId: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sections: mockSections,
      bookings: [],

      addSection: (section) =>
        set((state) => ({ sections: [...state.sections, section] })),

      updateSection: (section) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === section.id ? section : s
          ),
        })),

      createBooking: (sectionId) =>
        set((state) => {
          if (state.bookings.some((b) => b.sectionId === sectionId)) {
            return state;
          }
          return {
            bookings: [
              ...state.bookings,
              { sectionId, status: "pending", bookedAt: new Date().toISOString() },
            ],
          };
        }),

      payBooking: (sectionId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.sectionId === sectionId ? { ...b, status: "paid" } : b
          ),
        })),
    }),
    { name: "sectionlap-store" }
  )
);
