import type { Bindings, StructuredPlan } from "./types";
import { fetchWithRetry } from "./fetchRetry";

// Calls visual-plan-service (Python/FastAPI) which renders the GIF/MP4 and
// uploads it to R2 itself. Its own returned gifUrl/mp4Url aren't reused here
// — the bucket is private, so this Worker presigns fresh GET URLs from the
// r2Key* fields instead (see r2.ts).
export async function renderPlan(
  env: Bindings,
  planId: string,
  plan: StructuredPlan,
  stepImages: (string | null)[] | null,
): Promise<{ r2KeyGif: string; r2KeyMp4: string }> {
  const res = await fetchWithRetry(`${env.VISUAL_SERVICE_URL.replace(/\/$/, "")}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId,
      userId: "anon",
      title: plan.title,
      isCycle: plan.isCycle ?? false,
      steps: plan.steps.map((step, i) => ({
        ...step,
        image: stepImages?.[i] ?? null,
      })),
      totalDays: plan.totalDays,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`visual-plan-service ${res.status}: ${body}`);
  }

  const body = (await res.json()) as { r2KeyGif: string; r2KeyMp4: string };
  return body;
}
