"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type FeedbackCategory = "general" | "bug" | "suggestion" | "performance";

const CATEGORIES: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: "general", label: "ทั่วไป", icon: "💬" },
  { value: "bug", label: "แจ้งบัก", icon: "🐛" },
  { value: "suggestion", label: "ข้อเสนอแนะ", icon: "💡" },
  { value: "performance", label: "ประสิทธิภาพ", icon: "⚡" },
];

export default function FeedbackPreload() {
  const token = useAuthStore((s) => s.token);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("กรุณาเลือกคะแนน"); return; }
    if (!message.trim()) { setError("กรุณาเขียนข้อความ"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ platform: "website", category, rating, message: message.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "ส่ง feedback ไม่สำเร็จ");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#fce4ec] flex items-center justify-center mx-auto text-4xl">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a2e]">ขอบคุณสำหรับ Feedback!</h2>
          <p className="text-gray-500 text-sm">ความคิดเห็นของคุณช่วยให้เราพัฒนา SectionLap ได้ดีขึ้น</p>
          <button
            onClick={() => { setSubmitted(false); setRating(0); setMessage(""); setCategory("general"); }}
            className="rounded-full border border-[#ede8ed] px-5 py-2 text-sm font-medium text-gray-600 hover:border-[#e8275e] hover:text-[#e8275e] transition-colors"
          >
            ส่งอีกครั้ง
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#fce4ec] flex items-center justify-center mx-auto text-2xl">
            💌
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">ส่ง Feedback</h1>
          <p className="text-sm text-gray-500">ช่วยเราพัฒนา SectionLap ให้ดีขึ้น</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stars */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1a1a2e]">คะแนนความพอใจ</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={star <= (hovered || rating) ? "text-[#e8275e]" : "text-gray-200"}>★</span>
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-center text-xs text-gray-400">
                {["", "ต้องปรับปรุง", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม!"][hovered || rating]}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1a1a2e]">ประเภท</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border-2 transition-all ${
                    category === cat.value
                      ? "border-[#e8275e] bg-[#fce4ec] text-[#e8275e]"
                      : "border-[#ede8ed] text-gray-600 hover:border-[#e8275e]/40"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="feedback-msg" className="text-sm font-semibold text-[#1a1a2e]">ข้อความ</label>
            <textarea
              id="feedback-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="บอกเราว่าคุณคิดอย่างไร..."
              className="w-full rounded-xl border border-[#ede8ed] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8275e] focus:border-transparent resize-none transition-all"
            />
            <p className="text-right text-xs text-gray-400">{message.length} / 500</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#e8275e] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#c01f4e] transition-colors shadow-lg shadow-pink-200"
          >
            {loading ? "กำลังส่ง..." : "ส่ง Feedback"}
          </button>
        </form>
      </div>
    </main>
  );
}
