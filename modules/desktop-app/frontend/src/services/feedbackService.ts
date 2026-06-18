import { request } from "../lib/api";

export type FeedbackCategory = "general" | "bug" | "suggestion" | "performance";

export interface SubmitFeedbackPayload {
  platform: string;
  category: FeedbackCategory;
  rating: number;
  message: string;
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<void> {
  const res = await request("/api/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.error) throw new Error(res.error);
}
