import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

async function visualPlanWorkerURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.VISUAL_PLAN_WORKER_URL ?? "http://localhost:8787").replace(/\/$/, "");
}

// History listing still goes through the Go backend — the standalone worker
// (modules/visual-plan-worker) doesn't persist plans (anonymous-first, no DB).
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/visual-plans`, {
    headers: { Authorization: token },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

// Generation goes through the standalone visual-plan-worker instead of the Go
// backend — see modules/visual-plan-worker. No auth required (anonymous-first,
// matching the page's own "log in to keep your history" messaging); its
// response shape is adapted here to match the VisualPlan the frontend expects.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { promptText?: string };
  if (!body.promptText?.trim()) {
    return NextResponse.json({ error: "promptText is required" }, { status: 400 });
  }

  const base = await visualPlanWorkerURL();
  const res = await fetch(`${base}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promptText: body.promptText }),
  });
  const resBody = (await res.json()) as
    | { error: string }
    | { planId: string; title: string; gifUrl: string; mp4Url: string };

  if (!res.ok || "error" in resBody) {
    const message = "error" in resBody ? resBody.error : "generate failed";
    return NextResponse.json({ error: message }, { status: res.ok ? 502 : res.status });
  }

  return NextResponse.json({
    data: {
      id: resBody.planId,
      userId: "anon",
      title: resBody.title,
      promptText: body.promptText,
      gifUrl: resBody.gifUrl,
      mp4Url: resBody.mp4Url,
      createdAt: new Date().toISOString(),
    },
  });
}
