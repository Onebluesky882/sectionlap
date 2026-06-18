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
      <main className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-4">
          <div className="h-6 bg-gray-100 rounded animate-pulse w-1/3" />
          <div className="h-10 bg-gray-100 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
        </div>
      </main>
    );
  }

  if (error || !section) {
    return (
      <main className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-4xl">😕</p>
          <p className="text-gray-500">{error ?? "ไม่พบ section นี้"}</p>
          <button onClick={() => router.back()} className="text-sm text-[#e8275e] underline underline-offset-2">
            กลับ
          </button>
        </div>
      </main>
    );
  }

  async function handleBook() {
    await submitBooking(id);
    router.push("/profile");
  }

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-2xl mx-auto px-4 py-10 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#e8275e] transition-colors"
      >
        ← กลับ
      </button>

      {/* Title block */}
      <div className="space-y-3">
        <span className="inline-block bg-[#fce4ec] text-[#e8275e] text-xs font-semibold px-3 py-1 rounded-full">
          {section.category}
        </span>
        <h1 className="text-3xl font-bold text-[#1a1a2e]">{section.title}</h1>
        <p className="text-gray-500 leading-relaxed">{section.description}</p>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-[#ede8ed] overflow-hidden">
        <div className="bg-[#f5f5f7] px-5 py-3 border-b border-[#ede8ed]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">รายละเอียด</p>
        </div>
        <div className="divide-y divide-[#ede8ed]">
          {[
            { label: "ผู้สอน", value: section.teacher },
            { label: "ระยะเวลา", value: `${section.durationMinutes} นาที` },
            { label: "จำนวนที่นั่ง", value: `${section.capacity} ที่นั่ง` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-[#1a1a2e]">{value}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-t border-[#ede8ed]">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">ราคา</p>
            <p className="text-2xl font-bold text-[#e8275e]">
              {section.price === 0 ? "ฟรี" : `฿${section.price.toLocaleString()}`}
            </p>
          </div>
          <button
            disabled={booking}
            onClick={handleBook}
            className="rounded-full bg-[#e8275e] text-white px-7 py-3 text-sm font-semibold disabled:opacity-40 hover:bg-[#c01f4e] transition-colors shadow-lg shadow-pink-200"
          >
            {booking ? "กำลังจอง..." : "จองเลย"}
          </button>
        </div>
      </div>
    </main>
  );
}
