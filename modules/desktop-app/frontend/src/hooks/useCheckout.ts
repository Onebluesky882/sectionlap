import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
<<<<<<< HEAD

export function useCheckout(sectionId: string) {
  const booking = useAppStore((state) =>
    state.bookings.find((b) => b.sectionId === sectionId)
  );
  const createBooking = useAppStore((state) => state.createBooking);
  const payBooking = useAppStore((state) => state.payBooking);
  const [paid, setPaid] = useState(booking?.status === "paid");

  useEffect(() => {
    if (!booking) {
      createBooking(sectionId);
=======
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
>>>>>>> wansing
    }
  }, [booking, sectionId, createBooking]);

  function pay() {
<<<<<<< HEAD
    payBooking(sectionId);
    setPaid(true);
  }

  return { paid, pay };
=======
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
>>>>>>> wansing
}
