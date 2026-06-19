"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function LoginPreload() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAdminAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, password);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7FAFA]">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">SectionLap Admin</h1>
          <p className="text-sm text-[#64748B] mt-1">เข้าสู่ระบบสำหรับผู้ดูแล</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
          />

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
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </main>
  );
}
