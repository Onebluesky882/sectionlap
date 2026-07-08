"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSection } from "@/hooks/useSection";
import { useBooking } from "@/hooks/useBooking";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSectionWallet } from "@/hooks/useWallet";
import { useSlipVerification } from "@/hooks/useSlipVerification";
import { useRouter } from "next/navigation";

export default function SectionDetailPreload({ id }: { id: string }) {
  const { section, isLoading, error } = useSection(id);
  const { submitBooking, isLoading: booking, error: bookingError } = useBooking();
  const bookings = useBookingStore((s) => s.bookings);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myBooking = bookings.find((b) => b.sectionId === id);
  const isEnrolled = myBooking?.status === "paid";
  const { wallet } = useSectionWallet(id);
  const slip = useSlipVerification(myBooking?.id ?? "");

  function openBooking() {
    if (!section) return;
    if (section.questions && section.questions.length > 0) {
      setAnswers(section.questions.map(() => ""));
      setShowModal(true);
    } else {
      handleBook([]);
    }
  }

  async function handleBook(ans: string[]) {
    await submitBooking(id, ans);
    setShowModal(false);
  }

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

  const hasQuestions = section.questions && section.questions.length > 0;
  const allAnswered = answers.every((a) => a.trim().length > 0);

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
          {hasQuestions && (
            <div className="px-6 py-4 text-sm">
              <span className="text-[#64748B]">ต้องตอบคำถามก่อน booking</span>
              <span className="ml-2 text-xs bg-[#DDE8E6] text-[#1A2332] rounded-full px-2 py-0.5">
                {section.questions.length} ข้อ
              </span>
            </div>
          )}
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
          {isEnrolled || user?.role === "teacher" ? (
            <Link
              href={`/sections/${id}/live`}
              className="rounded-full bg-[#1A2332] text-white px-8 py-3 text-sm font-semibold hover:bg-[#2d3a4f] transition-colors"
            >
              เข้าห้องเรียน
            </Link>
          ) : myBooking ? (
            <span className="rounded-full bg-[#EBF2F7] text-[#4A7294] px-6 py-3 text-sm font-semibold">
              รอชำระเงิน
            </span>
          ) : (
            <button
              disabled={booking}
              onClick={openBooking}
              className="rounded-full bg-[#6AA098] text-white px-8 py-3 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
            >
              {booking ? "กำลังจอง..." : "จองเลย"}
            </button>
          )}
        </div>
      </div>

      {/* Payment step — shown once a pending booking exists */}
      {myBooking && myBooking.status === "pending" && (
        <div className="rounded-2xl border border-[#DDE8E6] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#1A2332]">ชำระเงิน</h2>
            <p className="text-sm text-[#64748B] mt-1">
              โอนเงินตรงเข้าบัญชีผู้สอนตาม QR/เลขบัญชีด้านล่าง แล้วอัปโหลดรูปสลิปเพื่อยืนยันอัตโนมัติ
            </p>
          </div>

          {wallet ? (
            <div className="flex items-start gap-6 flex-wrap">
              {wallet.qrCodeUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wallet.qrCodeUrl}
                  alt="QR code รับเงิน"
                  className="w-40 h-40 object-contain rounded-xl border border-[#DDE8E6]"
                />
              )}
              <div className="text-sm space-y-1">
                <p className="text-[#64748B]">ชื่อบัญชี: <span className="font-medium text-[#1A2332]">{wallet.bankAccountNameTh}</span></p>
                <p className="text-[#64748B]">เลขบัญชี/พร้อมเพย์: <span className="font-medium text-[#1A2332]">{wallet.bankAccountNumber}</span></p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">ครูยังไม่ได้ตั้งค่าช่องทางรับเงิน</p>
          )}

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) slip.verify(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!wallet || slip.phase === "decoding" || slip.phase === "verifying"}
              className="rounded-full bg-[#6AA098] text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
            >
              {slip.phase === "decoding" ? "กำลังอ่าน QR จากสลิป..."
                : slip.phase === "verifying" ? "กำลังตรวจสอบ..."
                : "อัปโหลดสลิปโอนเงิน"}
            </button>

            {slip.phase === "done" && (
              <p className="text-sm text-[#6AA098]">✓ ยืนยันการชำระเงินสำเร็จ — รีเฟรชหน้าเพื่อเข้าห้องเรียน</p>
            )}
            {slip.phase === "error" && (
              <p className="text-sm text-red-500">{slip.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Pre-booking questions modal */}
      {showModal && hasQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#DDE8E6]">
              <h2 className="text-lg font-bold text-[#1A2332]">ตอบคำถามก่อน booking</h2>
              <p className="text-xs text-[#64748B] mt-1">ครูต้องการตรวจสอบความพร้อมของคุณก่อนเข้าร่วม class นี้</p>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {section.questions.map((q, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-medium text-[#1A2332]">
                    {i + 1}. {q}
                  </label>
                  <textarea
                    rows={2}
                    value={answers[i] ?? ""}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                    placeholder="คำตอบของคุณ..."
                    className="w-full border border-[#DDE8E6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6AA098] resize-none"
                  />
                </div>
              ))}
            </div>

            {bookingError && (
              <p className="px-6 text-sm text-red-500">{bookingError}</p>
            )}

            <div className="px-6 py-4 border-t border-[#DDE8E6] flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-[#DDE8E6] px-5 py-2 text-sm font-medium hover:bg-[#F7FAFA] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!allAnswered || booking}
                onClick={() => handleBook(answers)}
                className="rounded-full bg-[#6AA098] text-white px-6 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
              >
                {booking ? "กำลังจอง..." : "ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
