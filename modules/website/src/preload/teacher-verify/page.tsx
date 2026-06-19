"use client";

import { useState } from "react";
import { useTeacherVerify } from "@/hooks/useTeacherVerify";

export default function TeacherVerifyPreload() {
  const [fullName, setFullName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState("");
  const { submitProfile, isLoading, error } = useTeacherVerify();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitProfile({ fullName, idCard, phone, expertise });
  }

  const field = (
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
      />
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#6AA098] uppercase tracking-widest">ยืนยันตัวตน</span>
          <h1 className="text-2xl font-bold text-[#1A2332]">ข้อมูลผู้สอน</h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            กรอกข้อมูลเพื่อยืนยันตัวตนก่อนเริ่มสอน ระบบจะตรวจสอบและเปิดใช้งานบัญชีให้อัตโนมัติ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("ชื่อ-นามสกุล", "text", "ชื่อตามบัตรประชาชน", fullName, setFullName)}
          {field("เลขบัตรประชาชน", "text", "X-XXXX-XXXXX-XX-X", idCard, setIdCard)}
          {field("เบอร์โทรศัพท์", "tel", "08X-XXX-XXXX", phone, setPhone)}
          {field("ความเชี่ยวชาญ", "text", "เช่น HTML, CSS, JavaScript, React", expertise, setExpertise)}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors mt-2"
          >
            {isLoading ? "กำลังยืนยัน..." : "ยืนยันตัวตน"}
          </button>
        </form>

        <p className="text-xs text-[#64748B]/60 text-center leading-relaxed">
          ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อยืนยันตัวตนเท่านั้น
        </p>
      </div>
    </main>
  );
}
