"use client";

import { useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminFetch";

export type AdminSection = {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;
  teacherId: string;
  category: string;
  durationMinutes: number;
  capacity: number;
  status: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function useAdminSections() {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/sections");
      const body = (await res.json()) as { data?: AdminSection[]; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "โหลดข้อมูลไม่สำเร็จ");
      setSections(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveSection = useCallback(async (id: string) => {
    const res = await adminFetch(`/api/admin/sections/${id}/approve`, { method: "POST" });
    if (!res.ok) throw new Error("อนุมัติไม่สำเร็จ");
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s)));
  }, []);

  const rejectSection = useCallback(async (id: string) => {
    const res = await adminFetch(`/api/admin/sections/${id}/reject`, { method: "POST" });
    if (!res.ok) throw new Error("ปฏิเสธไม่สำเร็จ");
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)));
  }, []);

  return { sections, isLoading, error, fetchSections, approveSection, rejectSection };
}
