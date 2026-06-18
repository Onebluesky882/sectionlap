"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSections } from "@/hooks/useSections";

export default function DashboardPreload() {
  const { user, signOut } = useAuth();
  const { sections, isLoading } = useSections();
  const mine = sections.filter((s) => s.teacherId === user?.id);

  const stats = [
    { label: "Section", value: mine.length },
    { label: "ที่นั่งรวม", value: mine.reduce((a, s) => a + s.capacity, 0) },
    { label: "รายได้รวม", value: `฿${mine.reduce((a, s) => a + s.price, 0).toLocaleString()}` },
  ];

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#6AA098] uppercase tracking-widest">TEACHER</p>
          <h1 className="text-2xl font-bold text-[#1A2332]">{user?.name}</h1>
        </div>
        <button onClick={signOut} className="text-xs text-[#64748B] hover:text-[#6AA098] transition-colors mt-1">
          ออกจากระบบ
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-[#DDE8E6] border border-[#DDE8E6] rounded-2xl overflow-hidden">
        {stats.map(({ label, value }) => (
          <div key={label} className="px-6 py-5">
            <p className="text-2xl font-bold text-[#1A2332]">{value}</p>
            <p className="text-xs text-[#64748B] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1A2332]">Section ของฉัน</h2>
        <div className="flex gap-2">
          <Link
            href="/dashboard/report"
            className="rounded-full border border-[#DDE8E6] px-4 py-1.5 text-xs font-semibold text-[#64748B] hover:border-[#6C93B2] hover:text-[#6C93B2] transition-all"
          >
            Report
          </Link>
          <Link
            href="/dashboard/sections/new"
            className="rounded-full bg-[#6AA098] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#4D8078] transition-colors"
          >
            + เพิ่ม Section
          </Link>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#F7FAFA] animate-pulse" />)}
        </div>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DDE8E6] py-20 text-center space-y-3">
          <p className="text-3xl opacity-20">✏️</p>
          <p className="text-sm text-[#64748B]">ยังไม่มี section</p>
          <Link href="/dashboard/sections/new" className="text-sm font-semibold text-[#6AA098] underline underline-offset-2">
            สร้างเลย
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {mine.map((s) => (
            <div
              key={s.id}
              className="group flex items-center justify-between rounded-xl border border-[#DDE8E6] px-5 py-4 hover:border-[#6AA098]/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-semibold text-[#1A2332] truncate">{s.title}</p>
                <p className="text-xs text-[#64748B]">
                  {s.category} · {s.durationMinutes} นาที · {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
                </p>
              </div>
              <Link
                href={`/dashboard/sections/${s.id}/edit`}
                className="text-xs text-[#64748B] group-hover:text-[#6AA098] transition-colors ml-6 shrink-0"
              >
                แก้ไข →
              </Link>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}
