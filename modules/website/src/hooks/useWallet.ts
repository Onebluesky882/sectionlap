"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

export type TeacherWallet = {
  teacherId: string;
  qrCodeR2Key: string;
  qrCodeUrl?: string;
  bankAccountNameTh: string;
  bankAccountNumber: string;
  updatedAt: string;
};

export function useOwnWallet() {
  const [wallet, setWallet] = useState<TeacherWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/teacher/wallet");
      if (!res.ok) throw new Error("โหลด wallet ไม่สำเร็จ");
      const { data } = (await res.json()) as { data: TeacherWallet | null };
      setWallet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { wallet, isLoading, error, refetch };
}

export function useSectionWallet(sectionId: string) {
  const [wallet, setWallet] = useState<TeacherWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/sections/${sectionId}/wallet`)
      .then((r) => {
        if (!r.ok) throw new Error("โหลดข้อมูลการชำระเงินไม่สำเร็จ");
        return r.json() as Promise<{ data: TeacherWallet | null }>;
      })
      .then(({ data }) => setWallet(data))
      .catch((e) => setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"))
      .finally(() => setIsLoading(false));
  }, [sectionId]);

  return { wallet, isLoading, error };
}
