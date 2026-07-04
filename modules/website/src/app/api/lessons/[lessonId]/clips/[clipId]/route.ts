import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string; clipId: string }> },
) {
  const { lessonId, clipId } = await params;
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/lessons/${lessonId}/clips/${clipId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
