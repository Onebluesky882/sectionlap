"use client";

import { useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminFetch";

export type AdminStats = {
  pendingTeachers: number;
  approvedTeachers: number;
  pendingSections: number;
  approvedSections: number;
  totalStudents: number;
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/stats");
      const body = (await res.json()) as { data?: AdminStats; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "โหลดข้อมูลไม่สำเร็จ");
      setStats(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, error, fetchStats };
}
