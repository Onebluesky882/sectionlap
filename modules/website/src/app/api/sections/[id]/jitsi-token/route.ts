import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization") ?? "";
  const userName = req.headers.get("x-user-name") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/sections/${id}/jitsi-token`, {
    headers: { Authorization: token, "X-User-Name": userName },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
