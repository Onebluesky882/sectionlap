import { create } from "zustand";

export type Booking = {
  id: string;
  sectionId: string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled";
};

type BookingStore = {
  bookings: Booking[];
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (slot: string) => void;
  addBooking: (booking: Booking) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  bookings: [],
  selectedDate: null,
  selectedTimeSlot: null,
  isLoading: false,
  error: null,
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initialState,

  setSelectedDate: (date) => set({ selectedDate: date, selectedTimeSlot: null }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  addBooking: (booking) => set((s) => ({ bookings: [...s.bookings, booking] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
