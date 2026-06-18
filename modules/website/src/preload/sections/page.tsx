"use client";

import Link from "next/link";
import { useState } from "react";
import { useSections } from "@/hooks/useSections";

export default function SectionsPreload() {
  const { sections, isLoading, error } = useSections();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ทั้งหมด");

  const categories = ["ทั้งหมด", ...Array.from(new Set(sections.map((s) => s.category)))];

  const filtered = sections.filter((s) => {
    const matchCat = selectedCat === "ทั้งหมด" || s.category === selectedCat;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.teacher.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-[#1a1a2e]">คลาสเรียนทั้งหมด</h1>
        <p className="text-gray-500 text-sm">เลือก section และเริ่มเรียนสดได้ทันที</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="ค้นหาคลาสหรือครู..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[#ede8ed] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8275e] focus:border-transparent"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCat === cat
                  ? "bg-[#e8275e] text-white"
                  : "bg-[#f5f5f7] text-gray-600 hover:bg-[#fce4ec] hover:text-[#e8275e]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#ede8ed] p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-4xl">🔍</p>
          <p className="text-gray-500">ไม่พบคลาสที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/sections/${s.id}`}
              className="group block bg-white rounded-2xl border border-[#ede8ed] p-5 hover:border-[#e8275e] hover:shadow-lg hover:shadow-pink-100 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-block bg-[#fce4ec] text-[#e8275e] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {s.category}
                </span>
                <span className="text-sm font-bold text-[#1a1a2e] shrink-0">
                  {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-[#1a1a2e] group-hover:text-[#e8275e] transition-colors line-clamp-2">
                  {s.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#ede8ed]">
                <span className="font-medium text-gray-600">{s.teacher}</span>
                <div className="flex gap-2">
                  <span>⏱ {s.durationMinutes} นาที</span>
                  <span>·</span>
                  <span>💺 {s.capacity}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
