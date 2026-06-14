import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";

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
    }
  }, [booking, sectionId, createBooking]);

  function pay() {
    payBooking(sectionId);
    setPaid(true);
  }

  return { paid, pay };
}
