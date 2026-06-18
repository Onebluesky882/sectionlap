"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  const field = (
    type: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
    />
  );

  return (
    <main className="min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1A2332] px-12 py-14">
        <Link href="/">
          <Image src="/logo.svg" alt="SectionLap" width={130} height={32} className="brightness-0 invert opacity-80" />
        </Link>
        <div className="space-y-6">
          <p className="text-4xl font-bold text-white leading-snug">
            ห้องเรียน<br />
            <span className="text-[#6AA098]">ไม่มีขอบเขต</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            เรียนสดกับครูผู้เชี่ยวชาญ จ่ายเฉพาะ section ที่ต้องการ ไม่มีค่าสมาชิกรายเดือน
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2026 SectionLap</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm space-y-8">

          {/* Mode toggle */}
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332] mb-1">
              {mode === "login" ? "ยินดีต้อนรับกลับ" : "เริ่มต้นใช้งาน"}
            </h1>
            <p className="text-sm text-[#64748B]">
              {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-[#6AA098] font-semibold hover:underline underline-offset-2"
              >
                {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && field("text", "ชื่อ-นามสกุล", name, setName)}
            {field("email", "อีเมล", email, setEmail)}
            {field("password", "รหัสผ่าน (อย่างน้อย 8 ตัว)", password, setPassword)}

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                {(["student", "teacher"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      role === r
                        ? "border-[#6AA098] bg-[#EAF4F2] text-[#4D8078]"
                        : "border-[#DDE8E6] text-[#64748B] hover:border-[#6AA098]/50"
                    }`}
                  >
                    {r === "student" ? "นักเรียน" : "ผู้สอน"}
                  </button>
                ))}
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
              className="w-full rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
            >
              {isLoading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}
