"use client";

import { useBooking } from "@/hooks/useBooking";

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const SECTION_ID = "section-1";

export default function BookingPreload() {
  const {
    selectedDate,
    selectedTimeSlot,
    isLoading,
    error,
    setSelectedDate,
    setSelectedTimeSlot,
    submitBooking,
  } = useBooking();

  const canSubmit = !!selectedDate && !!selectedTimeSlot && !isLoading;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold">จองพื้นที่</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">เลือกวันที่</label>
        <input
          type="date"
          value={selectedDate ?? ""}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">เลือกเวลา</label>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedTimeSlot(slot)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selectedTimeSlot === slot
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        disabled={!canSubmit}
        onClick={() => submitBooking(SECTION_ID)}
        className="w-full rounded-full bg-black text-white py-3 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
      >
        {isLoading ? "กำลังจอง..." : "ยืนยันการจอง"}
      </button>
    </main>
  );
}
