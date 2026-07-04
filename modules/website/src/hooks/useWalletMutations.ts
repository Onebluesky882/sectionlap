"use client";

import { useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { TeacherWallet } from "@/hooks/useWallet";

export function useWalletMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveWallet(
    qrCodeR2Key: string,
    bankAccountNameTh: string,
    bankAccountNumber: string,
  ): Promise<TeacherWallet | null> {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/teacher/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeR2Key, bankAccountNameTh, bankAccountNumber }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "บันทึก wallet ไม่สำเร็จ");
      }
      const { data } = (await res.json()) as { data: TeacherWallet };
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { saveWallet, isLoading, error };
}
