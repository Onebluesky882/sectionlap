"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/store/useAuthStore";

export default function LoginPreload() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const { login, register, isLoading, error } = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      login(email, password);
    } else {
      register(name, email, password, role);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">SectionLap</h1>
          <p className="text-sm text-gray-500">
            {mode === "login" ? "เข้าสู่ระบบเพื่อจอง section" : "สมัครสมาชิก"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="ชื่อ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}

          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          {mode === "register" && (
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(["student", "teacher"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    role === r ? "bg-black text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {r === "student" ? "นักเรียน" : "ผู้สอน"}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-black text-white py-3 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
          >
            {isLoading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-medium text-black underline underline-offset-2"
          >
            {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </p>
      </div>
    </main>
  );
}
