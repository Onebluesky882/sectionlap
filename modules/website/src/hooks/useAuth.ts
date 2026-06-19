"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { User, UserRole } from "@/store/useAuthStore";

export function useAuth() {
  const { user, token, isLoading, error, setUser, setLoading, setError, logout } = useAuthStore();
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
      const body = await res.json() as { data?: { user: User; token: string }; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setUser(body.data.user, body.data.token);
      if (body.data.user.role === "teacher" && !body.data.user.verified) {
        router.push("/teacher-verify");
      } else {
        router.push(body.data.user.role === "teacher" ? "/dashboard" : "/sections");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string, role: UserRole) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const body = await res.json() as { data?: { user: User; token: string }; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error ?? "สมัครสมาชิกไม่สำเร็จ");
      setUser(body.data.user, body.data.token);
      if (body.data.user.role === "teacher" && !body.data.user.verified) {
        router.push("/teacher-verify");
      } else {
        router.push(body.data.user.role === "teacher" ? "/dashboard" : "/onboarding");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function restoreSession() {
    const storedToken = useAuthStore.getState().token;
    if (!storedToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const { data } = (await res.json()) as { data: User };
      setUser(data, storedToken);
    } catch {
      logout();
    }
  }

  async function signOut() {
    const storedToken = useAuthStore.getState().token;
    if (storedToken) {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken}` },
      }).catch(() => {});
    }
    logout();
    router.push("/login");
  }

  return { user, token, isLoading, error, login, register, restoreSession, signOut };
}
