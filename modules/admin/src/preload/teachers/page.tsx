"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdminTeachers } from "@/hooks/useAdminTeachers";

export default function TeachersPreload() {
  const { teachers, isLoading, error, fetchTeachers, approveTeacher, rejectTeacher } = useAdminTeachers();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  async function handleApprove(id: string) {
    try {
      await approveTeacher(id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectTeacher(id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">ครูผู้สอน</h1>
          <p className="text-sm text-[#64748B] mt-1">จัดการการอนุมัติครูผู้สอน</p>
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
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">ชื่อ</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">User ID</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">วิชาเชี่ยวชาญ</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">วันที่ยื่น</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">สถานะ</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.userId} className="border-b border-[#DDE8E6] last:border-0">
                  <td className="px-4 py-3 text-[#1A2332] font-medium">
                    {t.profile?.fullName ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[#64748B] font-mono text-xs">{t.userId}</td>
                  <td className="px-4 py-3 text-[#64748B]">{t.profile?.expertise ?? "-"}</td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {t.profile?.submittedAt
                      ? new Date(t.profile.submittedAt).toLocaleDateString("th-TH")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.isVerified ? "อนุมัติแล้ว" : "รอการอนุมัติ"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!t.isVerified && (
                        <button
                          onClick={() => handleApprove(t.userId)}
                          className="px-3 py-1.5 rounded-lg bg-[#6AA098] text-white text-xs font-medium hover:bg-[#4D8078] transition-colors"
                        >
                          อนุมัติ
                        </button>
                      )}
                      {t.isVerified && (
                        <button
                          onClick={() => handleReject(t.userId)}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && teachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                    ไม่มีข้อมูลครูผู้สอน
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
