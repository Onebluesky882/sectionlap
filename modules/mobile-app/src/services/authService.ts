import { request } from "../lib/api";
import type { User, UserRole } from "../types";

export interface SessionData {
  token: string;
  user: User & { email: string };
}

export async function login(email: string, password: string): Promise<SessionData> {
  const res = await request<SessionData>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.data) throw new Error(res.error ?? "Login failed");
  return res.data;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<SessionData> {
  const res = await request<SessionData>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.data) throw new Error(res.error ?? "Signup failed");
  return res.data;
}

export async function logout(): Promise<void> {
  await request("/api/auth/signout", { method: "POST" });
}

export async function getMe(): Promise<(User & { email: string }) | null> {
  const res = await request<User & { email: string }>("/api/auth/me");
  return res.data;
}
