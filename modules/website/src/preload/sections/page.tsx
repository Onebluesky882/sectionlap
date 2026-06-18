"use client";

import Link from "next/link";
import { useState } from "react";
import { useSections } from "@/hooks/useSections";

export default function SectionsPreload() {
  const { sections, isLoading, error } = useSections();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ทั้งหมด");

  const categories = ["ทั้งหมด", ...Array.from(new Set(sections.map((s) => s.category)))];

  const list = sections.filter((s) => {
    const okCat = cat === "ทั้งหมด" || s.category === cat;
    const q = search.toLowerCase();
    const okQ = !q || s.title.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q);
    return okCat && okQ;
  });

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-5xl mx-auto px-4 py-10">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-[#6AA098] uppercase tracking-widest mb-1">BROWSE</p>
          <h1 className="text-3xl font-bold text-[#1A2332]">คลาสเรียนทั้งหมด</h1>
        </div>
        <input
          type="text"
          placeholder="ค้นหาคลาสหรือครู..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-[#DDE8E6] rounded-xl px-4 py-2.5 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all"
        />
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              cat === c
                ? "bg-[#1A2332] text-white"
                : "border border-[#DDE8E6] text-[#64748B] hover:border-[#6AA098] hover:text-[#6AA098]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#DDE8E6] p-5 space-y-3 animate-pulse">
              <div className="h-3 bg-[#DDE8E6] rounded w-1/3" />
              <div className="h-5 bg-[#DDE8E6] rounded w-3/4" />
              <div className="h-3 bg-[#DDE8E6] rounded w-full" />
              <div className="h-3 bg-[#DDE8E6] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : list.length === 0 ? (
        <div className="text-center py-24 space-y-2">
          <p className="text-4xl opacity-30">🔍</p>
          <p className="text-[#64748B] text-sm">ไม่พบคลาสที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((s, i) => (
            <Link
              key={s.id}
              href={`/sections/${s.id}`}
              className={`group block rounded-2xl border transition-all duration-200 p-5 space-y-4
                ${i === 0 && cat === "ทั้งหมด" && !search
                  ? "sm:col-span-2 border-[#6AA098]/40 bg-[#EAF4F2] hover:border-[#6AA098]"
                  : "border-[#DDE8E6] bg-white hover:border-[#6C93B2]/50 hover:bg-[#EBF2F7]/30"
                }`}
            >
              {/* Category + price */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-[#6AA098] uppercase tracking-wider">
                  {s.category}
                </span>
                <span className="text-sm font-bold text-[#1A2332] shrink-0">
                  {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
                </span>
              </div>

              {/* Title + desc */}
              <div className="space-y-1.5">
                <h2 className={`font-semibold text-[#1A2332] group-hover:text-[#4D8078] transition-colors line-clamp-2 ${i === 0 && !search && cat === "ทั้งหมด" ? "text-xl" : "text-base"}`}>
                  {s.title}
                </h2>
                <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed">{s.description}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 border-t border-[#DDE8E6]">
                <span className="font-medium text-[#1A2332]">{s.teacher}</span>
                <span>{s.durationMinutes} นาที · {s.capacity} ที่นั่ง</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
