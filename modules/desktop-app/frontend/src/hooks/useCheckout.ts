import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import type { BookingError } from "../types";

export function useCheckout(sectionId: string) {
  const currentUser = useAppStore((state) => state.currentUser);
  const booking = useAppStore((state) =>
    currentUser
      ? state.bookings.find(
          (b) => b.sectionId === sectionId && b.studentId === currentUser.id
        )
      : undefined
  );
  const createBooking = useAppStore((state) => state.createBooking);
  const payBooking = useAppStore((state) => state.payBooking);
  const failBooking = useAppStore((state) => state.failBooking);
  const retryBooking = useAppStore((state) => state.retryBooking);
  const [error, setError] = useState<BookingError | null>(null);

  useEffect(() => {
    if (!booking) {
      createBooking(sectionId).then((result) => setError(result.error));
    }
  }, [booking, sectionId, createBooking]);

  function pay() {
    if (!booking) return;
    payBooking(booking.id);
  }

  function simulateFailure() {
    if (!booking) return;
    failBooking(booking.id);
  }

  function retry() {
    if (!booking) return;
    retryBooking(booking.id);
  }

  return {
    booking,
    error,
    paid: booking?.status === "paid",
    failed: booking?.status === "failed",
    pay,
    simulateFailure,
    retry,
  };
}
