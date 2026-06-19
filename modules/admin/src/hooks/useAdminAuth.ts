"use client";

import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import type { AdminUser } from "@/store/useAdminAuthStore";

export function useAdminAuth() {
  const { user, token, isLoading, error, setUser, setLoading, setError, logout } = useAdminAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json()) as { data?: { user: AdminUser; token: string }; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      if (body.data.user.role !== "admin") throw new Error("ไม่มีสิทธิ์เข้าถึง");
      setUser(body.data.user, body.data.token);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function restoreSession() {
    const storedToken = useAdminAuthStore.getState().token;
    if (!storedToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const { data } = (await res.json()) as { data: AdminUser };
      if (data.role !== "admin") {
        logout();
        return;
      }
      setUser(data, storedToken);
    } catch {
      logout();
    }
  }

  async function signOut() {
    const storedToken = useAdminAuthStore.getState().token;
    if (storedToken) {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken}` },
      }).catch(() => {});
    }
    logout();
    router.push("/login");
  }

  return { user, token, isLoading, error, login, restoreSession, signOut };
}
