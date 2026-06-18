"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdminSections } from "@/hooks/useAdminSections";

const statusLabel: Record<string, { label: string; className: string }> = {
  pending: { label: "รอการอนุมัติ", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700" },
  rejected: { label: "ปฏิเสธ", className: "bg-red-100 text-red-700" },
};

export default function SectionsPreload() {
  const { sections, isLoading, error, fetchSections, approveSection, rejectSection } = useAdminSections();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  async function handleApprove(id: string) {
    try {
      await approveSection(id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectSection(id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">คลาสเรียน</h1>
          <p className="text-sm text-[#64748B] mt-1">จัดการการอนุมัติคลาสเรียน</p>
        </div>

        {(error ?? actionError) && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error ?? actionError}
          </div>
        )}

        {isLoading && <p className="text-sm text-[#64748B]">กำลังโหลด...</p>}

        <div className="bg-white rounded-2xl border border-[#DDE8E6] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE8E6] bg-[#F7FAFA]">
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">ชื่อคลาส</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">ครู</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">หมวดหมู่</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">ราคา</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">วันที่</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">สถานะ</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => {
                const status = statusLabel[s.status] ?? { label: s.status, className: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={s.id} className="border-b border-[#DDE8E6] last:border-0">
                    <td className="px-4 py-3 text-[#1A2332] font-medium max-w-[200px] truncate">{s.title}</td>
                    <td className="px-4 py-3 text-[#64748B]">{s.teacher}</td>
                    <td className="px-4 py-3 text-[#64748B]">{s.category}</td>
                    <td className="px-4 py-3 text-[#1A2332]">
                      {s.price.toLocaleString("th-TH")} ฿
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {new Date(s.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#6AA098] text-white text-xs font-medium hover:bg-[#4D8078] transition-colors"
                          >
                            อนุมัติ
                          </button>
                        )}
                        {s.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            ปฏิเสธ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && sections.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#64748B]">
                    ไม่มีข้อมูลคลาสเรียน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
