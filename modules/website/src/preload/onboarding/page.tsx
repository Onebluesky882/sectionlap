"use client";

import { useState } from "react";
import { useStudentProfile } from "@/hooks/useStudentProfile";

const SUBJECTS = [
  "คณิตศาสตร์",
  "วิทยาศาสตร์",
  "ฟิสิกส์",
  "เคมี",
  "ชีววิทยา",
  "ภาษาอังกฤษ",
  "ภาษาไทย",
  "ประวัติศาสตร์",
  "ภูมิศาสตร์",
  "คอมพิวเตอร์",
  "ดนตรี",
  "ศิลปะ",
];

export default function OnboardingPreload() {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submitProfile } = useStudentProfile();

  function toggleSubject(subject: string) {
    setInterests((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (!nickname.trim()) return setError("กรุณากรอกชื่อเล่น");
    if (!age || ageNum < 5 || ageNum > 100) return setError("กรุณากรอกอายุที่ถูกต้อง");

    setIsLoading(true);
    setError(null);
    try {
      await submitProfile(nickname.trim(), ageNum, interests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">ยินดีต้อนรับ!</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            บอกเราเล็กน้อยเพื่อปรับการเรียนให้เหมาะกับคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2332]">ชื่อเล่น</label>
            <input
              type="text"
              placeholder="เช่น นิว, เจ, แม็ก"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2332]">อายุ</label>
            <input
              type="number"
              placeholder="เช่น 15"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={5}
              max={100}
              required
              className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1A2332]">
              วิชาที่สนใจเรียน{" "}
              <span className="text-[#64748B] font-normal">(เลือกได้หลายวิชา)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => {
                const selected = interests.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      selected
                        ? "border-[#6AA098] bg-[#EAF4F2] text-[#4D8078]"
                        : "border-[#DDE8E6] text-[#64748B] hover:border-[#6AA098]/50"
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
            >
              {isLoading ? "กำลังบันทึก..." : "เริ่มเรียนเลย"}
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/sections")}
              className="px-5 py-3.5 text-sm text-[#64748B] hover:text-[#1A2332] transition-colors"
            >
              ข้ามไปก่อน
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
