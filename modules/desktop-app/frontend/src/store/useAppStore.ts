import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingRecord, CreateBookingResult, Section, User, UserRole } from "../types";
import { mockSections } from "../data/mockSections";
import { MOCK_STUDENT, MOCK_TEACHER } from "../data/mockUsers";

interface AppStore {
  sections: Section[];
  bookings: BookingRecord[];
  currentUser: User | null;
  users: User[];
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  createBooking: (sectionId: string) => CreateBookingResult;
  payBooking: (bookingId: string) => void;
  failBooking: (bookingId: string) => void;
  retryBooking: (bookingId: string) => void;
  switchRole: () => void;
  login: (userId: string) => boolean;
  signup: (name: string, role: UserRole) => User;
  logout: () => void;
}

/**
 * A booking counts against a section's capacity unless its payment has
 * failed — a failed payment frees the seat for retry or for another student.
 */
function isActiveBooking(booking: BookingRecord): boolean {
  return booking.status !== "failed";
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sections: mockSections,
      bookings: [],
      currentUser: null,
      users: [MOCK_STUDENT, MOCK_TEACHER],

      addSection: (section) =>
        set((state) => ({ sections: [...state.sections, section] })),

      updateSection: (section) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === section.id ? section : s
          ),
        })),

      createBooking: (sectionId) => {
        const state = get();
        if (!state.currentUser) {
          return { booking: null, error: "NOT_AUTHENTICATED" as any };
        }
        const studentId = state.currentUser.id;

        const existing = state.bookings.find(
          (b) =>
            b.sectionId === sectionId &&
            b.studentId === studentId &&
            isActiveBooking(b)
        );
        if (existing) {
          return { booking: existing, error: "ALREADY_BOOKED" };
        }

        const section = state.sections.find((s) => s.id === sectionId);
        const activeCount = state.bookings.filter(
          (b) => b.sectionId === sectionId && isActiveBooking(b)
        ).length;
        if (section && activeCount >= section.capacity) {
          return { booking: null, error: "CAPACITY_FULL" };
        }

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
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? { ...b, status: "paid", paidAt: new Date().toISOString() }
              : b
          ),
        })),

      failBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "failed" } : b
          ),
        })),

      retryBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId && b.status === "failed"
              ? { ...b, status: "pending", paidAt: undefined }
              : b
          ),
        })),

      switchRole: () =>
        set((state) => {
          if (!state.currentUser) return {};
          return {
            currentUser:
              state.currentUser.role === "teacher"
                ? state.users.find((u) => u.role === "student") || MOCK_STUDENT
                : state.users.find((u) => u.role === "teacher") || MOCK_TEACHER,
          };
        }),

      login: (userId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      signup: (name, role) => {
        const newUser: User = {
          id: `user-${role}-${Date.now()}`,
          name,
          role,
        };
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        return newUser;
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: "sectionlap-store",
      version: 3,
      migrate: (_persisted, version) => {
        if (version < 3) {
          return {
            sections: mockSections,
            bookings: [],
            currentUser: null,
            users: [MOCK_STUDENT, MOCK_TEACHER],
          };
        }
        return _persisted as AppStore;
      },
    }
  )
);
