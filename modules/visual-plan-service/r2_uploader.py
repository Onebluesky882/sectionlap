"""Upload generated GIF/MP4 to Cloudflare R2 (S3-compatible) via presigned PUT.

boto3's managed transfer (upload_file/put_object, which spins up s3transfer's
own thread pool) hangs indefinitely whenever it's run in a thread — to_thread,
a manual threading.Thread, doesn't matter — while an asyncio event loop is
concurrently running in the main thread. Reproduced in isolation, with no
ffmpeg/subprocess involved at all: identical boto3 call completes in ~5s as a
plain synchronous script, but never returns under the FastAPI/uvicorn event
loop (Python 3.14 + boto3 1.35.99 on this machine). generate_presigned_url is
pure local HMAC signing (no network, no thread), so using boto3 only for that
and doing the actual byte transfer with a plain async HTTP client sidesteps
the hang entirely.
"""

import os
import boto3
import httpx
from botocore.client import Config


def _client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


async def upload(local_path: str, r2_key: str, content_type: str) -> str:
    """Upload file and return public URL."""
    bucket = os.environ["R2_BUCKET"]
    base_url = os.environ["R2_PUBLIC_BASE_URL"].rstrip("/")

    put_url = _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": r2_key, "ContentType": content_type},
        ExpiresIn=300,
    )

    with open(local_path, "rb") as f:
        data = f.read()

    async with httpx.AsyncClient(timeout=60.0) as http:
        resp = await http.put(put_url, content=data, headers={"Content-Type": content_type})
        resp.raise_for_status()

    return f"{base_url}/{r2_key}"


def delete(r2_key: str) -> None:
    bucket = os.environ["R2_BUCKET"]
    _client().delete_object(Bucket=bucket, Key=r2_key)
