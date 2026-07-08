"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdminTeachers, aiVerdictLabel } from "@/hooks/useAdminTeachers";

const statusLabels: Record<string, { text: string; className: string }> = {
  approved: { text: "อนุมัติแล้ว", className: "bg-green-100 text-green-700" },
  pending: { text: "รอการอนุมัติ", className: "bg-yellow-100 text-yellow-700" },
  rejected: { text: "ถูกปฏิเสธ", className: "bg-red-100 text-red-700" },
};

export default function TeachersPreload() {
  const { teachers, isLoading, error, fetchTeachers, approveTeacher, rejectTeacher } = useAdminTeachers();
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  async function handleConfirmReject(id: string) {
    if (!rejectReason.trim()) return;
    try {
      await rejectTeacher(id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason("");
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
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">เอกสาร</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">สถานะ</th>
                <th className="text-left px-4 py-3 text-[#64748B] font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => {
                const status = t.profile?.verificationStatus ?? (t.isVerified ? "approved" : "pending");
                const statusInfo = statusLabels[status] ?? statusLabels.pending;
                const verdictNote = aiVerdictLabel(t.profile?.aiVerdict);

                return (
                  <tr key={t.userId} className="border-b border-[#DDE8E6] last:border-0 align-top">
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
                      {t.documentUrl ? (
                        <a
                          href={t.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6AA098] underline underline-offset-2 text-xs"
                        >
                          ดูเอกสาร
                        </a>
                      ) : (
                        <span className="text-[#64748B]/50 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 space-y-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                      {status === "pending" && verdictNote && (
                        <p className="text-xs text-amber-600 max-w-[16rem]">AI ตรวจพบ: {verdictNote}</p>
                      )}
                      {status === "rejected" && t.profile?.rejectionReason && (
                        <p className="text-xs text-red-500 max-w-[16rem]">{t.profile.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rejectingId === t.userId ? (
                        <div className="flex flex-col gap-2 max-w-[14rem]">
                          <input
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="เหตุผลการปฏิเสธ"
                            className="border border-[#DDE8E6] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-200"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmReject(t.userId)}
                              disabled={!rejectReason.trim()}
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium disabled:opacity-40 hover:bg-red-700 transition-colors"
                            >
                              ยืนยันปฏิเสธ
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {status !== "approved" && (
                            <button
                              onClick={() => handleApprove(t.userId)}
                              className="px-3 py-1.5 rounded-lg bg-[#6AA098] text-white text-xs font-medium hover:bg-[#4D8078] transition-colors"
                            >
                              อนุมัติ
                            </button>
                          )}
                          {status !== "rejected" && (
                            <button
                              onClick={() => setRejectingId(t.userId)}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                            >
                              ปฏิเสธ
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && teachers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#64748B]">
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
