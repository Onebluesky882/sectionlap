"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type FeedbackCategory = "general" | "bug" | "suggestion" | "performance";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug Report" },
  { value: "suggestion", label: "Suggestion" },
  { value: "performance", label: "Performance" },
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
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!message.trim()) { setError("Please write a message."); return; }
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
        throw new Error(body.error ?? "Failed to submit feedback");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
          <p className="text-gray-500">Your input helps us improve SectionLap.</p>
          <button
            onClick={() => { setSubmitted(false); setRating(0); setMessage(""); setCategory("general"); }}
            className="mt-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            Submit another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Send Feedback</h1>
          <p className="text-sm text-gray-500">Help us improve SectionLap by sharing your experience.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Overall Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl focus:outline-none transition-transform hover:scale-110"
                >
                  <span className={star <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-600 hover:border-indigo-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="feedback-msg" className="text-sm font-semibold">Message</label>
            <textarea
              id="feedback-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us what you think..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Sending…" : "Send Feedback"}
          </button>
        </form>
      </div>
    </main>
  );
}
