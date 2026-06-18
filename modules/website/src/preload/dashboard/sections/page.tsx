"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSections } from "@/hooks/useSections";
import DataTable from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import type { Section } from "@/store/useSectionStore";

const COLUMNS: Column<Section>[] = [
  {
    key: "title",
    label: "ชื่อ",
    sortable: true,
    render: (s) => (
      <span className="font-medium text-gray-900 line-clamp-1">{s.title}</span>
    ),
  },
  { key: "category", label: "หมวดหมู่", sortable: true },
  {
    key: "price",
    label: "ราคา",
    sortable: true,
    render: (s) => (
      <span className="font-mono text-sm">
        {s.price === 0 ? "ฟรี" : `฿${s.price.toLocaleString()}`}
      </span>
    ),
  },
  {
    key: "durationMinutes",
    label: "นาที",
    sortable: true,
    render: (s) => `${s.durationMinutes} นาที`,
  },
  {
    key: "capacity",
    label: "ที่นั่ง",
    sortable: true,
    render: (s) => `${s.capacity} ที่นั่ง`,
  },
  {
    key: "id",
    label: "",
    render: (s) => (
      <div className="flex items-center gap-2 justify-end">
        <Link
          href={`/sections/${s.id}`}
          className="text-xs text-gray-400 hover:text-black transition-colors"
        >
          ดู
        </Link>
        <Link
          href={`/dashboard/sections/${s.id}/edit`}
          className="text-xs font-medium text-black underline underline-offset-2"
        >
          แก้ไข
        </Link>
      </div>
    ),
    className: "text-right w-28",
  },
];

export default function DashboardSectionsPreload() {
  const { user, signOut } = useAuth();
  const { sections, isLoading } = useSections();

  const mySections = sections.filter((s) => s.teacherId === user?.id) as unknown as Section[];

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs text-gray-400 mb-1">
            <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
            <span className="mx-1">/</span>
            <span className="text-black">Sections</span>
          </nav>
          <h1 className="text-2xl font-bold">จัดการ Sections</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sections/new"
            className="rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + เพิ่ม Section
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-gray-400 hover:text-black transition-colors"
          >
            ออก
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-black">Overview</Link>
        <span className="font-medium text-black">Sections</span>
        <Link href="/dashboard/report" className="text-gray-400 hover:text-black">Report</Link>
      </div>

      <DataTable<Section>
        columns={COLUMNS}
        data={mySections as unknown as Section[]}
        isLoading={isLoading}
        keyField="id"
        searchKeys={["title", "category"]}
        pageSize={10}
        emptyText="ยังไม่มี section — กด + เพิ่ม Section เพื่อเริ่มต้น"
      />
    </main>
  );
}
