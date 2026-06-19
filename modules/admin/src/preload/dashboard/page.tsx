"use client";

import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdminStats } from "@/hooks/useAdminStats";

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "bg-[#1A2332] text-white border-[#1A2332]" : "bg-white border-[#DDE8E6]"}`}>
      <p className={`text-sm font-medium ${accent ? "text-white/60" : "text-[#64748B]"}`}>{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent ? "text-white" : "text-[#1A2332]"}`}>{value}</p>
    </div>
  );
}

export default function DashboardPreload() {
  const { stats, isLoading, error, fetchStats } = useAdminStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">แดชบอร์ด</h1>
          <p className="text-sm text-[#64748B] mt-1">ภาพรวมระบบ SectionLap</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading && <p className="text-sm text-[#64748B]">กำลังโหลด...</p>}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="ครูรอการอนุมัติ" value={stats.pendingTeachers} accent />
            <StatCard label="คลาสรอการอนุมัติ" value={stats.pendingSections} accent />
            <StatCard label="ครูที่อนุมัติแล้ว" value={stats.approvedTeachers} />
            <StatCard label="คลาสที่อนุมัติแล้ว" value={stats.approvedSections} />
            <StatCard label="นักเรียนทั้งหมด" value={stats.totalStudents} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
