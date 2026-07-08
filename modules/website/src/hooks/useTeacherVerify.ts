"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useAuthStore } from "@/store/useAuthStore";

export type TeacherVerificationStatus = "pending" | "approved" | "rejected";

export type TeacherProfile = {
  teacherId: string;
  fullName: string;
  idCard: string;
  phone: string;
  expertise: string;
  submittedAt: string;
  identityDocR2Key: string;
  verificationStatus: TeacherVerificationStatus;
  rejectionReason?: string;
  aiVerdict?: string;
  aiConfidence?: number;
  documentUrl?: string;
};

export function useTeacherVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await authFetch("/api/teacher/profile");
      const body = (await res.json()) as { data?: TeacherProfile | null };
      setProfile(body.data ?? null);
    } catch {
      // Non-fatal — the submit form still renders if the fetch fails.
    } finally {
      setIsFetching(false);
    }
  }, []);

  async function submitProfile(data: {
    fullName: string;
    idCard: string;
    phone: string;
    expertise: string;
    documentKey: string;
  }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/teacher/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as { data?: { status: TeacherVerificationStatus; profile: TeacherProfile }; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "บันทึกข้อมูลไม่สำเร็จ");

      setProfile(body.data.profile);

      // Only reflect verified/redirect when the backend actually approved —
      // never assume approval just because the submission succeeded.
      if (body.data.status === "approved" && user) {
        const token = useAuthStore.getState().token!;
        setUser({ ...user, verified: true }, token);
        router.push("/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }

  return { submitProfile, fetchProfile, profile, isLoading, isFetching, error };
}
