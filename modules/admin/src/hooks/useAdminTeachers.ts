"use client";

import { useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminFetch";

export type TeacherVerificationStatus = "pending" | "approved" | "rejected";

export type TeacherProfile = {
  fullName: string;
  idCard: string;
  phone: string;
  expertise: string;
  submittedAt: string;
  verificationStatus: TeacherVerificationStatus;
  rejectionReason?: string;
  aiVerdict?: string;
  aiConfidence?: number;
};

export type TeacherRow = {
  userId: string;
  isVerified: boolean;
  profile: TeacherProfile | null;
  documentUrl?: string;
};

const aiVerdictLabels: Record<string, string> = {
  name_mismatch: "ชื่อไม่ตรงกับที่ลงทะเบียน",
  underage: "อายุต่ำกว่า 18 ปี",
  low_confidence: "AI ไม่มั่นใจในผลตรวจ",
  unreadable: "เอกสารไม่ชัดเจนหรืออ่านไม่ได้",
  ai_unconfigured: "ยังไม่ได้ตั้งค่าระบบตรวจสอบอัตโนมัติ",
};

export function aiVerdictLabel(verdict?: string): string | null {
  if (!verdict || verdict === "auto_approved") return null;
  return aiVerdictLabels[verdict] ?? verdict;
}

export function useAdminTeachers() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/teachers");
      const body = (await res.json()) as { data?: TeacherRow[]; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "โหลดข้อมูลไม่สำเร็จ");
      setTeachers(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveTeacher = useCallback(async (id: string) => {
    const res = await adminFetch(`/api/admin/teachers/${id}/approve`, { method: "POST" });
    if (!res.ok) throw new Error("อนุมัติไม่สำเร็จ");
    setTeachers((prev) =>
      prev.map((t) =>
        t.userId === id
          ? { ...t, isVerified: true, profile: t.profile ? { ...t.profile, verificationStatus: "approved" } : null }
          : t,
      ),
    );
  }, []);

  const rejectTeacher = useCallback(async (id: string, reason: string) => {
    const res = await adminFetch(`/api/admin/teachers/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("ปฏิเสธไม่สำเร็จ");
    setTeachers((prev) =>
      prev.map((t) =>
        t.userId === id
          ? {
              ...t,
              isVerified: false,
              profile: t.profile ? { ...t.profile, verificationStatus: "rejected", rejectionReason: reason } : null,
            }
          : t,
      ),
    );
  }, []);

  return { teachers, isLoading, error, fetchTeachers, approveTeacher, rejectTeacher };
}
