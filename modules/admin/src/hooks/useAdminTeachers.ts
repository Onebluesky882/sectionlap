"use client";

import { useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminFetch";

export type TeacherProfile = {
  fullName: string;
  idCard: string;
  phone: string;
  expertise: string;
  submittedAt: string;
};

export type TeacherRow = {
  userId: string;
  isVerified: boolean;
  profile: TeacherProfile | null;
};

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
    setTeachers((prev) => prev.map((t) => (t.userId === id ? { ...t, isVerified: true } : t)));
  }, []);

  const rejectTeacher = useCallback(async (id: string) => {
    const res = await adminFetch(`/api/admin/teachers/${id}/reject`, { method: "POST" });
    if (!res.ok) throw new Error("ปฏิเสธไม่สำเร็จ");
    setTeachers((prev) => prev.map((t) => (t.userId === id ? { ...t, isVerified: false } : t)));
  }, []);

  return { teachers, isLoading, error, fetchTeachers, approveTeacher, rejectTeacher };
}
