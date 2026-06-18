"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export type StudentProfile = {
  studentId: string;
  nickname: string;
  age: number;
  interests: string[];
};

export function useStudentProfile() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  async function submitProfile(nickname: string, age: number, interests: string[]) {
    const res = await fetch("/api/student/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname, age, interests }),
    });
    const body = (await res.json()) as { data?: StudentProfile; error?: string };
    if (!res.ok || !body.data) throw new Error(body.error ?? "บันทึกข้อมูลไม่สำเร็จ");
    router.push("/sections");
  }

  async function getProfile(): Promise<StudentProfile | null> {
    if (!token) return null;
    const res = await fetch("/api/student/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = (await res.json()) as { data: StudentProfile | null };
    return body.data ?? null;
  }

  return { submitProfile, getProfile };
}
