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
    if (mode === "login") login(email, password);
    else register(name, email, password, role);
  }

  const inputCls = "w-full border border-[#ede8ed] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8275e] focus:border-transparent transition-all placeholder:text-gray-400";

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#fce4ec] mb-2">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {mode === "login" ? "ยินดีต้อนรับกลับ" : "เริ่มต้นกับ SectionLap"}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === "login" ? "เข้าสู่ระบบเพื่อจอง section" : "สมัครฟรี ไม่มีค่าใช้จ่ายรายเดือน"}
          </p>
        </div>

        {/* Tab */}
        <div className="flex rounded-xl border border-[#ede8ed] p-1 bg-[#f5f5f7]">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === m ? "bg-white text-[#e8275e] shadow-sm" : "text-gray-500"
              }`}
            >
              {m === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          )}

          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />

          <input
            type="password"
            placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputCls}
          />

          {mode === "register" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">บทบาทของคุณ</p>
              <div className="grid grid-cols-2 gap-2">
                {(["student", "teacher"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      role === r
                        ? "border-[#e8275e] bg-[#fce4ec] text-[#e8275e]"
                        : "border-[#ede8ed] text-gray-500 hover:border-[#e8275e]/50"
                    }`}
                  >
                    {r === "student" ? "🙋 นักเรียน" : "👩‍🏫 ผู้สอน"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#e8275e] text-white py-3 text-sm font-semibold disabled:opacity-40 hover:bg-[#c01f4e] transition-colors shadow-lg shadow-pink-200"
          >
            {isLoading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>
      </div>
    </main>
  );
}
