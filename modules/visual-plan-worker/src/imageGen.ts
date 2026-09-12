import type { Bindings, PlanStep } from "./types";

const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const STYLE_SUFFIX = ", simple flat vector icon illustration, clean lines, minimal, educational diagram style, white background";

// Generates one illustration per step via Cloudflare Workers AI, in parallel.
// Only called for isCycle plans — a linear roadmap keeps the plain text-card
// style. A failed generation for one step returns null for that step rather
// than failing the whole plan; the renderer falls back to a text-only card.
export async function generateStepImages(env: Bindings, steps: PlanStep[]): Promise<(string | null)[]> {
  return Promise.all(
    steps.map(async (step) => {
      const prompt = (step.imagePrompt || step.label).trim();
      if (!prompt) return null;
      try {
        const result = (await env.AI.run(MODEL, {
          prompt: prompt + STYLE_SUFFIX,
          steps: 6,
        })) as { image?: string };
        return result.image ?? null;
      } catch {
        return null;
      }
    }),
  );
}
