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
      <main className="min-h-[calc(100vh-56px)] max-w-2xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-3 bg-[#DDE8E6] rounded w-16" />
        <div className="h-8 bg-[#DDE8E6] rounded w-2/3" />
        <div className="h-4 bg-[#DDE8E6] rounded w-full" />
        <div className="h-48 bg-[#DDE8E6] rounded-2xl" />
      </main>
    );
  }

  if (error || !section) {
    return (
      <main className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-[#64748B] text-sm">{error ?? "ไม่พบ section นี้"}</p>
          <button onClick={() => router.back()} className="text-sm text-[#6AA098] underline">กลับ</button>
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
        className="text-xs text-[#64748B] hover:text-[#6AA098] transition-colors flex items-center gap-1"
      >
        ← กลับ
      </button>

      {/* Title */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-[#6AA098] uppercase tracking-widest">
          {section.category}
        </span>
        <h1 className="text-3xl font-bold text-[#1A2332] leading-snug">{section.title}</h1>
        <p className="text-[#64748B] leading-relaxed">{section.description}</p>
      </div>

      {/* Ticket card */}
      <div className="rounded-2xl border border-[#DDE8E6] overflow-hidden">
        {/* Details */}
        <div className="divide-y divide-[#DDE8E6]">
          {[
            { label: "ผู้สอน", value: section.teacher },
            { label: "ระยะเวลา", value: `${section.durationMinutes} นาที` },
            { label: "จำนวนที่นั่ง", value: `${section.capacity} ที่นั่ง` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-6 py-4 text-sm">
              <span className="text-[#64748B]">{label}</span>
              <span className="font-semibold text-[#1A2332]">{value}</span>
            </div>
          ))}
        </div>

        {/* Perforated divider */}
        <div className="relative border-t border-dashed border-[#DDE8E6] mx-0">
          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#DDE8E6]" />
          <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#DDE8E6]" />
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F7FAFA]">
          <div>
            <p className="text-[10px] text-[#64748B] uppercase tracking-widest mb-1">ราคา</p>
            <p className="text-3xl font-bold text-[#1A2332]">
              {section.price === 0 ? "ฟรี" : `฿${section.price.toLocaleString()}`}
            </p>
          </div>
          <button
            disabled={booking}
            onClick={handleBook}
            className="rounded-full bg-[#6AA098] text-white px-8 py-3 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
          >
            {booking ? "กำลังจอง..." : "จองเลย"}
          </button>
        </div>
      </div>

    </main>
  );
}
