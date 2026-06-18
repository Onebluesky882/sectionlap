"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { user, token, isLoading, error, setUser, setLoading, setError, logout } = useAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      const { data } = (await res.json()) as { data: { user: import("@/store/useAuthStore").User; token: string } };
      setUser(data.user, data.token);
      router.push(data.user.role === "teacher" ? "/dashboard" : "/sections");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string, role: import("@/store/useAuthStore").UserRole) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) throw new Error("สมัครสมาชิกไม่สำเร็จ");
      const { data } = (await res.json()) as { data: { user: import("@/store/useAuthStore").User; token: string } };
      setUser(data.user, data.token);
      router.push(data.user.role === "teacher" ? "/dashboard" : "/sections");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    logout();
    router.push("/login");
  }

  return { user, token, isLoading, error, login, register, signOut };
}
