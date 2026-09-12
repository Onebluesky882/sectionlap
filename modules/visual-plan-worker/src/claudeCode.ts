import type { Bindings, StructuredPlan } from "./types";
import { fetchWithRetry } from "./fetchRetry";

// Calls the claude-code-service sidecar (a normal Node process that shells
// out to the Claude Code CLI, authenticated via CLAUDE_CODE_OAUTH_TOKEN).
// This Worker can't run that CLI itself — no subprocess support in Workers —
// so this is the one hop that has to leave the edge.
export async function parsePlan(env: Bindings, promptText: string): Promise<StructuredPlan> {
  const res = await fetchWithRetry(`${env.CLAUDE_CODE_SERVICE_URL.replace(/\/$/, "")}/v1/parse-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": env.CLAUDE_CODE_SERVICE_SECRET,
    },
    body: JSON.stringify({ promptText }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`claude-code-service ${res.status}: ${body}`);
  }

  return (await res.json()) as StructuredPlan;
}
