import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import type { BookingError } from "../types";

export function useCheckout(sectionId: string) {
  const currentUser = useAppStore((s) => s.currentUser);
  const booking = useAppStore((s) =>
    currentUser
      ? s.bookings.find((b) => b.sectionId === sectionId && b.studentId === currentUser.id)
      : undefined
  );
  const createBooking = useAppStore((s) => s.createBooking);
  const payBooking = useAppStore((s) => s.payBooking);
  const failBooking = useAppStore((s) => s.failBooking);
  const retryBooking = useAppStore((s) => s.retryBooking);
  const [error, setError] = useState<BookingError | null>(null);
  const [initiated, setInitiated] = useState(false);

  useEffect(() => {
    if (booking || initiated) return;
    setInitiated(true);
    createBooking(sectionId).then((result) => setError(result.error));
  }, [booking, sectionId, createBooking, initiated]);

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
