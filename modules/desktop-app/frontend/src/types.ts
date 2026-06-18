<<<<<<< HEAD
=======
export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

>>>>>>> wansing
export interface Section {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;
<<<<<<< HEAD
  category: string;
  durationMinutes: number;
}

export interface BookingRecord {
  sectionId: string;
  status: "pending" | "paid";
  bookedAt: string;
=======
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

// Shared with the sync-service (Stage 4a) whiteboard and document-highlight
// rooms — see modules/sync-service/README.md.
export interface Stroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
>>>>>>> wansing
}
