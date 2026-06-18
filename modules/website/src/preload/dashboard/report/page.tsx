"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSections } from "@/hooks/useSections";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/store/useBookingStore";
import DataTable from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import type { Section } from "@/store/useSectionStore";

const TABLE_COLS: Column<Section>[] = [
  { key: "title", label: "Section", sortable: true, render: (s) => <span className="font-medium">{s.title}</span> },
  { key: "category", label: "หมวดหมู่", sortable: true },
  {
    key: "price",
    label: "ราคา",
    sortable: true,
    render: (s) => s.price === 0 ? <span className="text-green-600 text-xs font-medium">ฟรี</span> : `฿${s.price.toLocaleString()}`,
  },
  { key: "durationMinutes", label: "นาที", sortable: true, render: (s) => `${s.durationMinutes}` },
  { key: "capacity", label: "ที่นั่ง", sortable: true, render: (s) => `${s.capacity}` },
  {
    key: "teacher",
    label: "ผู้สอน",
    render: (s) => <span className="text-gray-500 text-xs">{s.teacher}</span>,
  },
];

type StatCardProps = { label: string; value: string | number; sub?: string; accent?: string };
function StatCard({ label, value, sub, accent = "bg-gray-50" }: StatCardProps) {
  return (
    <div className={`${accent} rounded-xl p-5 space-y-1`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

const DEV_RECS = [
  {
    priority: "HIGH",
    title: "DELETE /api/sections/:id",
    desc: "Backend ยังไม่มี endpoint ลบ section — เพิ่ม soft-delete + check ว่าไม่มี active bookings",
    tag: "backend",
  },
  {
    priority: "HIGH",
    title: "Payment Gateway Integration",
    desc: "payBooking ปัจจุบันเปลี่ยน status เป็น paid โดยตรง — ต้อง integrate Stripe/Omise/PromptPay",
    tag: "backend",
  },
  {
    priority: "MED",
    title: "Admin Dashboard",
    desc: "เพิ่ม role admin + หน้า /admin ดู users, sections, bookings ทั้งหมด (ไม่ใช่แค่ของตัวเอง)",
    tag: "fullstack",
  },
  {
    priority: "MED",
    title: "Section Search & Filter",
    desc: "Backend GET /api/sections รองรับ ?category= แล้ว — เพิ่ม ?q=, ?price_min=, ?price_max= และ full-text search",
    tag: "backend",
  },
  {
    priority: "MED",
    title: "R2 Public URL + CDN",
    desc: "ตอนนี้ R2 key เก็บใน DB แต่ไม่มี public URL — ต้องตั้ง R2 custom domain หรือ presigned GET URL",
    tag: "infra",
  },
  {
    priority: "MED",
    title: "Video Playback Page",
    desc: "เพิ่ม /sections/[id]/video ที่ดึง video chunks จาก R2 → play ด้วย HLS.js หรือ MSE",
    tag: "frontend",
  },
  {
    priority: "LOW",
    title: "Email Notifications",
    desc: "ส่ง email เมื่อ booking confirmed / payment success — ใช้ Resend หรือ Cloudflare Email Workers",
    tag: "backend",
  },
  {
    priority: "LOW",
    title: "Section Rating & Review",
    desc: "นักเรียนที่ enrolled แล้วสามารถให้คะแนน + รีวิว — เก็บใน table reviews",
    tag: "fullstack",
  },
  {
    priority: "LOW",
    title: "Playwright CI",
    desc: "เพิ่ม GitHub Actions workflow รัน test ทั้ง 3 platform อัตโนมัติ (backend → mobile → desktop → website)",
    tag: "devops",
  },
];

const TAG_COLOR: Record<string, string> = {
  backend:   "bg-blue-50 text-blue-700",
  frontend:  "bg-purple-50 text-purple-700",
  fullstack: "bg-orange-50 text-orange-700",
  infra:     "bg-gray-100 text-gray-600",
  devops:    "bg-green-50 text-green-700",
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-red-500",
  MED:  "text-yellow-600",
  LOW:  "text-gray-400",
};

export default function ReportPreload() {
  const { user } = useAuth();
  const { sections, isLoading } = useSections();
  const bookings = useBookingStore((s) => s.bookings);

  const stats = useMemo(() => {
    const total = sections.length;
    const free = sections.filter((s) => s.price === 0).length;
    const avgPrice = total
      ? Math.round(sections.filter((s) => s.price > 0).reduce((n, s) => n + s.price, 0) / Math.max(1, total - free))
      : 0;
    const totalCapacity = sections.reduce((n, s) => n + s.capacity, 0);
    const categories = [...new Set(sections.map((s) => s.category))].length;
    return { total, free, avgPrice, totalCapacity, categories };
  }, [sections]);

  const bookingStats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div>
        <nav className="text-xs text-gray-400 mb-1">
          <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
          <span className="mx-1">/</span>
          <span className="text-black">Report</span>
        </nav>
        <h1 className="text-2xl font-bold">Report & Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          ข้อมูล ณ {new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}
          {user && ` · ${user.name}`}
        </p>
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-black">Overview</Link>
        <Link href="/dashboard/sections" className="text-gray-400 hover:text-black">Sections</Link>
        <span className="font-medium text-black">Report</span>
      </div>

      {/* Stats */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Sections ทั้งหมด" value={stats.total} sub={`${stats.free} ฟรี`} />
          <StatCard label="หมวดหมู่" value={stats.categories} sub="categories" accent="bg-gray-50" />
          <StatCard label="ราคาเฉลี่ย" value={stats.avgPrice ? `฿${stats.avgPrice.toLocaleString()}` : "—"} sub="เฉพาะ paid" />
          <StatCard label="ที่นั่งรวม" value={stats.totalCapacity.toLocaleString()} sub="ทุก section" />
        </div>
      </section>

      {bookingStats.total > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bookings (session นี้)</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="รอดำเนินการ" value={bookingStats.pending} accent="bg-yellow-50" />
            <StatCard label="ยืนยันแล้ว" value={bookingStats.confirmed} accent="bg-green-50" />
            <StatCard label="ยกเลิก" value={bookingStats.cancelled} accent="bg-red-50" />
          </div>
        </section>
      )}

      {/* Sections Table */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">รายการ Sections</h2>
        <DataTable<Section>
          columns={TABLE_COLS}
          data={sections as unknown as Section[]}
          isLoading={isLoading}
          keyField="id"
          searchKeys={["title", "category", "teacher"]}
          pageSize={8}
          emptyText="ยังไม่มี section"
        />
      </section>

      {/* Dev Recommendations */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">แนะนำสำหรับ Dev</h2>
          <p className="text-xs text-gray-400 mt-0.5">สิ่งที่ควรพัฒนาต่อเพื่อ production-readiness</p>
        </div>

        <div className="space-y-2">
          {DEV_RECS.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-4 border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <span className={`text-xs font-bold mt-0.5 w-8 shrink-0 ${PRIORITY_COLOR[r.priority]}`}>
                {r.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 font-mono">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${TAG_COLOR[r.tag] ?? "bg-gray-100 text-gray-600"}`}>
                {r.tag}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Priority: <span className="text-red-500 font-medium">HIGH</span> = บล็อก production ·{" "}
          <span className="text-yellow-600 font-medium">MED</span> = ควรทำก่อน launch ·{" "}
          <span className="text-gray-400 font-medium">LOW</span> = nice-to-have
        </p>
      </section>
    </main>
  );
}
