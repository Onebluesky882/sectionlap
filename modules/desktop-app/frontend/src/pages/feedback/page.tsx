import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { submitFeedback, type FeedbackCategory } from "../../services/feedbackService";
import { Star, Send, CheckCircle } from "lucide-react";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug Report" },
  { value: "suggestion", label: "Suggestion" },
  { value: "performance", label: "Performance" },
];

export function FeedbackPage() {
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
      await submitFeedback({ platform: "desktop", category, rating, message: message.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <CheckCircle className="size-16 text-green-500" />
        <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
        <p className="text-muted-foreground">Your input helps us improve SectionLap.</p>
        <Button variant="outline" onClick={() => { setSubmitted(false); setRating(0); setMessage(""); setCategory("general"); }}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Send Feedback</h1>
      <p className="text-muted-foreground mb-6 text-sm">Help us improve SectionLap by sharing your experience.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium">{error}</div>
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
                className="focus:outline-none"
              >
                <Star
                  className={`size-8 transition-colors ${star <= (hovered || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
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
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${category === cat.value ? "bg-indigo-500 text-white border-indigo-500" : "border-border text-muted-foreground hover:border-indigo-400"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label htmlFor="feedback-message" className="text-sm font-semibold">Message</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Tell us what you think..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold gap-2"
        >
          {loading ? "Sending…" : "Send Feedback"}
          {!loading && <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
