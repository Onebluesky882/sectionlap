import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import type { BookingError } from "../types";

export function useCheckout(sectionId: string) {
  const currentUser = useAppStore((s) => s.currentUser);
  const booking = useAppStore((s) =>
    s.bookings.find((b) => b.sectionId === sectionId && b.studentId === currentUser.id)
  );
  const createBooking = useAppStore((s) => s.createBooking);
  const payBooking = useAppStore((s) => s.payBooking);
  const failBooking = useAppStore((s) => s.failBooking);
  const retryBooking = useAppStore((s) => s.retryBooking);
  const [error, setError] = useState<BookingError | null>(null);

  useEffect(() => {
    if (!booking) {
      const result = createBooking(sectionId);
      setError(result.error);
    }
  }, [booking, sectionId, createBooking]);

  return {
    booking,
    error,
    paid: booking?.status === "paid",
    failed: booking?.status === "failed",
    pay: () => booking && payBooking(booking.id),
    simulateFailure: () => booking && failBooking(booking.id),
    retry: () => booking && retryBooking(booking.id),
  };
}
