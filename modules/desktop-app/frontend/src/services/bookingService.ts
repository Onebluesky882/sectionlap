import { request } from "../lib/api";
import type { BookingRecord, CreateBookingResult } from "../types";

export async function listBookings(): Promise<BookingRecord[]> {
  const res = await request<BookingRecord[]>("/api/bookings");
  return res.data ?? [];
}

export async function createBooking(sectionId: string): Promise<CreateBookingResult> {
  const res = await request<BookingRecord>("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ sectionId }),
  });
  if (res.error === "ALREADY_BOOKED") return { booking: null, error: "ALREADY_BOOKED" };
  if (res.error === "CAPACITY_FULL") return { booking: null, error: "CAPACITY_FULL" };
  if (!res.data) throw new Error(res.error ?? "Failed to create booking");
  return { booking: res.data, error: null };
}

export async function payBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/pay`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to pay booking");
  return res.data;
}

export async function failBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/fail`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to fail booking");
  return res.data;
}

export async function retryBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/retry`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to retry booking");
  return res.data;
}

export async function cancelBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to cancel booking");
  return res.data;
}
