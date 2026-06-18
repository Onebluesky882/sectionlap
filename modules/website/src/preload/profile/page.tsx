"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/useBookingStore";

export default function ProfilePreload() {
  const { user, signOut } = useAuth();
  const bookings = useBookingStore((s) => s.bookings);

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">โปรไฟล์</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 hover:text-black transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ชื่อ</span>
          <span className="font-medium">{user?.name ?? "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">อีเมล</span>
          <span className="font-medium">{user?.email ?? "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">บทบาท</span>
          <span className="font-medium">{user?.role === "teacher" ? "ผู้สอน" : "นักเรียน"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">การจองของฉัน ({bookings.length})</h2>

        {bookings.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-gray-400 text-sm">ยังไม่มีการจอง</p>
            <Link href="/sections" className="text-sm font-medium underline underline-offset-2">
              เลือก section
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Section: {b.sectionId}</p>
                  <p className="text-xs text-gray-400">
                    {b.date} · {b.timeSlot}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    b.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {b.status === "confirmed" ? "ยืนยันแล้ว" : b.status === "cancelled" ? "ยกเลิก" : "รอดำเนินการ"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
