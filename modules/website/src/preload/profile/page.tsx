"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/useBookingStore";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
  pending: "รอดำเนินการ",
};

export default function ProfilePreload() {
  const { user, signOut } = useAuth();
  const bookings = useBookingStore((s) => s.bookings);

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Profile card */}
      <div className="rounded-2xl border border-[#ede8ed] overflow-hidden">
        <div className="bg-gradient-to-r from-[#e8275e] to-[#c01f4e] px-6 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.name}</p>
            <p className="text-pink-100 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {user?.role === "teacher" ? "👩‍🏫 ผู้สอน" : "🙋 นักเรียน"}
            </span>
          </div>
          <button
            onClick={signOut}
            className="ml-auto text-white/70 hover:text-white text-xs transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>

        <div className="divide-y divide-[#ede8ed]">
          {[
            { label: "ชื่อ", value: user?.name ?? "-" },
            { label: "อีเมล", value: user?.email ?? "-" },
            { label: "บทบาท", value: user?.role === "teacher" ? "ผู้สอน" : "นักเรียน" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-6 py-3.5 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-[#1a1a2e]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#1a1a2e]">การจองของฉัน ({bookings.length})</h2>
          <Link href="/sections" className="text-xs text-[#e8275e] font-medium hover:underline">
            + จองเพิ่ม
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[#ede8ed] space-y-3">
            <p className="text-3xl">📋</p>
            <p className="text-gray-400 text-sm">ยังไม่มีการจอง</p>
            <Link
              href="/sections"
              className="inline-block text-sm font-semibold text-[#e8275e] underline underline-offset-2"
            >
              เลือก section
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-2xl border border-[#ede8ed] px-5 py-4"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-sm text-[#1a1a2e]">Section: {b.sectionId}</p>
                  <p className="text-xs text-gray-400">
                    {b.date} · {b.timeSlot}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[b.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
