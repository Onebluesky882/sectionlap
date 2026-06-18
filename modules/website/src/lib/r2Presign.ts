import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type PresignResult = {
  url: string;
  key: string;
  expiresAt: string;
};

export type UploadType = "image" | "video-chunk";

function makeKey(type: UploadType, opts: { userId: string; name?: string; classId?: string; chunkIndex?: number }): string {
  const date = new Date().toISOString().slice(0, 10);
  if (type === "image") {
    const safeName = (opts.name ?? "file").replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    return `image/user-${opts.userId}-${safeName}-${date}`;
  }
  // video-chunk: video/{classId}/{chunkIndex:04d}.webm
  const idx = String(opts.chunkIndex ?? 0).padStart(4, "0");
  return `video/${opts.classId}/${idx}.webm`;
}

export async function createPresignedPut(
  opts: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    type: UploadType;
    userId: string;
    name?: string;
    classId?: string;
    chunkIndex?: number;
    contentType?: string;
  },
  expiresInSeconds = 900,
): Promise<PresignResult> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${opts.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: opts.accessKeyId,
      secretAccessKey: opts.secretAccessKey,
    },
  });

  const key = makeKey(opts.type, {
    userId: opts.userId,
    name: opts.name,
    classId: opts.classId,
    chunkIndex: opts.chunkIndex,
  });

  const command = new PutObjectCommand({
    Bucket: opts.bucketName,
    Key: key,
    ContentType: opts.contentType ?? (opts.type === "image" ? "image/jpeg" : "video/webm"),
  });

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return { url, key, expiresAt };
}
