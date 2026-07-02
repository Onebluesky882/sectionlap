import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/visual-plans`, {
    headers: { Authorization: token },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const body = await req.json();
  const res = await fetch(`${base}/api/visual-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(body),
  });
  const resBody = await res.json();
  return NextResponse.json(resBody, { status: res.status });
}
