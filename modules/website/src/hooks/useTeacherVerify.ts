"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useAuthStore } from "@/store/useAuthStore";

export function useTeacherVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  async function submitProfile(data: {
    fullName: string;
    idCard: string;
    phone: string;
    expertise: string;
  }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/teacher/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json() as { data?: { verified: boolean }; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "บันทึกข้อมูลไม่สำเร็จ");

      if (user) {
        const token = useAuthStore.getState().token!;
        setUser({ ...user, verified: true }, token);
      }
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }

  return { submitProfile, isLoading, error };
}
