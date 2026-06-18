"use client";

import { useSection } from "@/hooks/useSection";
import { useBooking } from "@/hooks/useBooking";
import { useRouter } from "next/navigation";

export default function SectionDetailPreload({ id }: { id: string }) {
  const { section, isLoading, error } = useSection(id);
  const { submitBooking, isLoading: booking } = useBooking();
  const router = useRouter();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  if (error || !section) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error ?? "ไม่พบ section นี้"}</p>
      </main>
    );
  }

  async function handleBook() {
    await submitBooking(id);
    router.push("/profile");
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12 space-y-8">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-black transition-colors">
        ← กลับ
      </button>

      <div className="space-y-3">
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          {section.category}
        </span>
        <h1 className="text-3xl font-bold">{section.title}</h1>
        <p className="text-gray-500">{section.description}</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ผู้สอน</span>
          <span className="font-medium">{section.teacher}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ระยะเวลา</span>
          <span className="font-medium">{section.durationMinutes} นาที</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ที่นั่ง</span>
          <span className="font-medium">{section.capacity} ที่นั่ง</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-lg font-bold">
            {section.price === 0 ? "ฟรี" : `฿${section.price.toLocaleString()}`}
          </span>
          <button
            disabled={booking}
            onClick={handleBook}
            className="rounded-full bg-black text-white px-6 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
          >
            {booking ? "กำลังจอง..." : "จองเลย"}
          </button>
        </div>
      </div>
    </main>
  );
}
