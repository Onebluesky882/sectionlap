import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/auth/signout`, {
    method: "POST",
    headers: { Authorization: token },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
