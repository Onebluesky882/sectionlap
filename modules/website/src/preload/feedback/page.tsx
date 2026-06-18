"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type Cat = "general" | "bug" | "suggestion" | "performance";
const CATS: { v: Cat; label: string }[] = [
  { v: "general",     label: "ทั่วไป" },
  { v: "bug",         label: "แจ้งปัญหา" },
  { v: "suggestion",  label: "ข้อเสนอแนะ" },
  { v: "performance", label: "ประสิทธิภาพ" },
];
const STAR_LABEL = ["", "ต้องปรับปรุง", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"];

export default function FeedbackPreload() {
  const token = useAuthStore((s) => s.token);
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [cat, setCat]       = useState<Cat>("general");
  const [msg, setMsg]       = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [err, setErr]       = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setErr("กรุณาให้คะแนน"); return; }
    if (!msg.trim()) { setErr("กรุณาเขียนข้อความ"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ platform: "website", category: cat, rating, message: msg.trim() }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(b.error ?? "เกิดข้อผิดพลาด");
      }
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-xs">
        <div className="w-16 h-16 rounded-full border-2 border-[#6AA098] flex items-center justify-center mx-auto">
          <span className="text-[#6AA098] text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[#1A2332]">ขอบคุณสำหรับ feedback</h2>
        <p className="text-sm text-[#64748B]">ความคิดเห็นของคุณช่วยให้เราพัฒนาได้ดีขึ้น</p>
        <button
          onClick={() => { setDone(false); setRating(0); setMsg(""); setCat("general"); }}
          className="text-sm text-[#6AA098] font-semibold underline underline-offset-2"
        >
          ส่งอีกครั้ง
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-lg mx-auto px-4 py-14 space-y-10">

      <div className="space-y-1">
        <p className="text-xs font-bold text-[#6AA098] uppercase tracking-widest">FEEDBACK</p>
        <h1 className="text-2xl font-bold text-[#1A2332]">บอกเราว่าคิดอย่างไร</h1>
        <p className="text-sm text-[#64748B]">ความคิดเห็นของคุณสำคัญกับเรามาก</p>
      </div>

      {err && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">{err}</div>
      )}

      <form onSubmit={submit} className="space-y-8">

        {/* Stars */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1A2332]">คะแนนความพอใจ</p>
          <div className="flex gap-3">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s} type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              >
                <span className={s <= (hover || rating) ? "text-[#6AA098]" : "text-[#DDE8E6]"}>★</span>
              </button>
            ))}
          </div>
          {(hover || rating) > 0 && (
            <p className="text-xs text-[#64748B]">{STAR_LABEL[hover || rating]}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1A2332]">ประเภท</p>
          <div className="flex flex-wrap gap-2">
            {CATS.map(({ v, label }) => (
              <button
                key={v} type="button"
                onClick={() => setCat(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  cat === v
                    ? "bg-[#1A2332] text-white border-[#1A2332]"
                    : "border-[#DDE8E6] text-[#64748B] hover:border-[#6AA098] hover:text-[#6AA098]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#1A2332]">ข้อความ</p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={5}
            placeholder="บอกเราว่าคุณคิดอย่างไร..."
            className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] resize-none transition-all"
          />
          <p className="text-right text-[10px] text-[#64748B]">{msg.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors"
        >
          {loading ? "กำลังส่ง..." : "ส่ง Feedback"}
        </button>

      </form>
    </main>
  );
}
