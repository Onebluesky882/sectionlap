"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSections } from "@/hooks/useSections";

export default function DashboardPreload() {
  const { user, signOut } = useAuth();
  const { sections, isLoading } = useSections();

  const mySections = sections.filter((s) => s.teacherId === user?.id);

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">{user?.name}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 hover:text-black transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Section ของฉัน ({mySections.length})</h2>
        <Link
          href="/dashboard/new"
          className="rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + เพิ่ม Section
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      ) : mySections.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-gray-400">ยังไม่มี section</p>
          <Link href="/dashboard/new" className="text-sm font-medium underline underline-offset-2">
            สร้าง section แรกของคุณ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {mySections.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4"
            >
              <div className="space-y-0.5">
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-gray-400">
                  {s.durationMinutes} นาที · {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
                </p>
              </div>
              <Link
                href={`/sections/${s.id}`}
                className="text-sm text-gray-400 hover:text-black transition-colors"
              >
                ดู →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
