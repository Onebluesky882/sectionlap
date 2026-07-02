import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function backendURL(): Promise<string> {
  const { env } = await getCloudflareContext();
  return (env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await backendURL();
  const res = await fetch(`${base}/api/visual-plans/${id}`);
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization") ?? "";
  const base = await backendURL();
  const res = await fetch(`${base}/api/visual-plans/${id}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
