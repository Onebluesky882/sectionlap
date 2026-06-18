"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { authFetch } from "@/lib/authFetch";
import type { Booking } from "@/store/useBookingStore";

export function useBooking() {
  const {
    bookings,
    selectedDate,
    selectedTimeSlot,
    isLoading,
    error,
    setSelectedDate,
    setSelectedTimeSlot,
    addBooking,
    setLoading,
    setError,
    reset,
  } = useBookingStore();

  async function submitBooking(sectionId: string) {
    if (!selectedDate || !selectedTimeSlot) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, date: selectedDate, timeSlot: selectedTimeSlot }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const { data } = (await res.json()) as { data: { booking: Booking } };
      addBooking(data.booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return {
    bookings,
    selectedDate,
    selectedTimeSlot,
    isLoading,
    error,
    setSelectedDate,
    setSelectedTimeSlot,
    submitBooking,
    reset,
  };
}
