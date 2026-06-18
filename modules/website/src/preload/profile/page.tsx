"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/useBookingStore";

const statusStyle: Record<string, string> = {
  confirmed: "bg-[#EAF4F2] text-[#4D8078]",
  cancelled:  "bg-red-50 text-red-500",
  pending:    "bg-[#EBF2F7] text-[#4A7294]",
};
const statusLabel: Record<string, string> = {
  confirmed: "ยืนยันแล้ว",
  cancelled:  "ยกเลิก",
  pending:    "รอดำเนินการ",
};

export default function ProfilePreload() {
  const { user, signOut } = useAuth();
  const bookings = useBookingStore((s) => s.bookings);

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* Avatar + info */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#1A2332] flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-[#1A2332] truncate">{user?.name}</p>
          <p className="text-sm text-[#64748B] truncate">{user?.email}</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6AA098] border border-[#6AA098]/30 rounded-full px-2.5 py-0.5">
            {user?.role === "teacher" ? "ผู้สอน" : "นักเรียน"}
          </span>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-[#64748B] hover:text-[#6AA098] transition-colors shrink-0"
        >
          ออกจากระบบ
        </button>
      </div>

      <hr className="border-[#DDE8E6]" />

      {/* Details */}
      <div className="rounded-2xl border border-[#DDE8E6] divide-y divide-[#DDE8E6] overflow-hidden">
        {[
          { label: "ชื่อ",   value: user?.name ?? "-" },
          { label: "อีเมล",  value: user?.email ?? "-" },
          { label: "บทบาท", value: user?.role === "teacher" ? "ผู้สอน" : "นักเรียน" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between px-5 py-3.5 text-sm">
            <span className="text-[#64748B]">{label}</span>
            <span className="font-medium text-[#1A2332]">{value}</span>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#1A2332]">
            การจอง <span className="text-[#64748B] font-normal">({bookings.length})</span>
          </h2>
          <Link href="/sections" className="text-xs font-semibold text-[#6AA098] hover:underline underline-offset-2">
            + จองเพิ่ม
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDE8E6] py-16 text-center space-y-3">
            <p className="text-3xl opacity-20">📋</p>
            <p className="text-sm text-[#64748B]">ยังไม่มีการจอง</p>
            <Link href="/sections" className="text-sm font-semibold text-[#6C93B2] underline underline-offset-2">
              เลือก section
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-[#DDE8E6] px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A2332]">Section: {b.sectionId}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{b.date} · {b.timeSlot}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[b.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {statusLabel[b.status] ?? b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
