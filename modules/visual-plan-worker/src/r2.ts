import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Bindings } from "./types";

// Mirrors modules/website/src/lib/r2Presign.ts's PUT presigner, but for GET —
// same account/bucket, same SigV4-over-R2 approach.
const MAX_EXPIRY_SECONDS = 6 * 24 * 60 * 60; // stay under R2/SigV4's 7-day cap

export async function presignGet(env: Bindings, key: string): Promise<string> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  const command = new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key });
  return getSignedUrl(client, command, { expiresIn: MAX_EXPIRY_SECONDS });
}
