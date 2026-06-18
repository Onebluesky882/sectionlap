"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSections } from "@/hooks/useSections";

export default function DashboardPreload() {
  const { user, signOut } = useAuth();
  const { sections, isLoading } = useSections();

  const mySections = sections.filter((s) => s.teacherId === user?.id);
  const totalRevenue = mySections.reduce((sum, s) => sum + s.price, 0);

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Dashboard</h1>
          <p className="text-sm text-gray-500">สวัสดี, {user?.name} 👋</p>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-[#e8275e] transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Section ทั้งหมด", value: mySections.length, icon: "📚" },
          { label: "ราคารวม", value: `฿${totalRevenue.toLocaleString()}`, icon: "💰" },
          { label: "ที่นั่งรวม", value: mySections.reduce((s, c) => s + c.capacity, 0), icon: "💺" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-[#ede8ed] p-5 space-y-2">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Section list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#1a1a2e]">Section ของฉัน</h2>
          <div className="flex gap-2">
            <Link
              href="/dashboard/report"
              className="rounded-full border border-[#ede8ed] px-4 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#e8275e] hover:text-[#e8275e] transition-colors"
            >
              📊 Report
            </Link>
            <Link
              href="/dashboard/sections/new"
              className="rounded-full bg-[#e8275e] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#c01f4e] transition-colors"
            >
              + เพิ่ม Section
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : mySections.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[#ede8ed] space-y-3">
            <p className="text-3xl">✏️</p>
            <p className="text-gray-400 text-sm">ยังไม่มี section</p>
            <Link
              href="/dashboard/sections/new"
              className="inline-block text-sm font-semibold text-[#e8275e] underline underline-offset-2"
            >
              สร้าง section แรกของคุณ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mySections.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl border border-[#ede8ed] px-5 py-4 hover:border-[#e8275e] transition-colors"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="font-semibold text-[#1a1a2e] truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">
                    {s.durationMinutes} นาที · {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`} · {s.capacity} ที่นั่ง
                  </p>
                </div>
                <span className="inline-block bg-[#fce4ec] text-[#e8275e] text-xs font-semibold px-2.5 py-1 rounded-full ml-4 shrink-0">
                  {s.category}
                </span>
                <Link
                  href={`/dashboard/sections/${s.id}/edit`}
                  className="ml-4 text-xs text-gray-400 hover:text-[#e8275e] transition-colors shrink-0"
                >
                  แก้ไข →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
