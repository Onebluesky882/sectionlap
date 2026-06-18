import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPresignedPut } from "@/lib/r2Presign";
import type { UploadType } from "@/lib/r2Presign";

type RequestBody = {
  type: UploadType;
  name?: string;
  classId?: string;
  chunkIndex?: number;
  contentType?: string;
};

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext();
  const backendUrl = env.BACKEND_URL ?? "http://localhost:8080";

  // Verify JWT with backend
  const meRes = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: user } = (await meRes.json()) as {
    data: { id: string; role: string };
  };

  const body = (await req.json()) as RequestBody;
  const { type, name, classId, chunkIndex, contentType } = body;

  if (!type || !["image", "video-chunk"].includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  if (type === "video-chunk" && (!classId || chunkIndex === undefined)) {
    return NextResponse.json({ error: "classId and chunkIndex required for video-chunk" }, { status: 400 });
  }

  // Teacher-only for video
  if (type === "video-chunk" && user.role !== "teacher") {
    return NextResponse.json({ error: "only teachers can upload videos" }, { status: 403 });
  }

  const result = await createPresignedPut({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME ?? "sectionlap-bucket",
    type,
    userId: user.id,
    name,
    classId,
    chunkIndex,
    contentType,
  });

  return NextResponse.json({ data: result });
}
