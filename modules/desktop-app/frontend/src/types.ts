export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;
  teacherId: string;
  category: string;
  durationMinutes: number;
  capacity: number;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface BookingRecord {
  id: string;
  sectionId: string;
  studentId: string;
  status: PaymentStatus;
  bookedAt: string;
  paidAt?: string;
}

export type BookingError = "ALREADY_BOOKED" | "CAPACITY_FULL";

export interface CreateBookingResult {
  booking: BookingRecord | null;
  error: BookingError | null;
}
