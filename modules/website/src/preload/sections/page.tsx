"use client";

import Link from "next/link";
import { useSections } from "@/hooks/useSections";

export default function SectionsPreload() {
  const { sections, isLoading, error } = useSections();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold">Section ทั้งหมด</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.id}
            href={`/sections/${s.id}`}
            className="block border border-gray-200 rounded-xl p-5 hover:border-black transition-colors space-y-2"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-semibold">{s.title}</h2>
              <span className="text-sm font-medium text-black">
                {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{s.teacher}</span>
              <span>·</span>
              <span>{s.durationMinutes} นาที</span>
              <span>·</span>
              <span>{s.capacity} ที่นั่ง</span>
            </div>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {s.category}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
