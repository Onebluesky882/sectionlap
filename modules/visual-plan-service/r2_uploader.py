"""Upload generated GIF/MP4 to Cloudflare R2 (S3-compatible)."""

import os
import boto3
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


def upload(local_path: str, r2_key: str, content_type: str) -> str:
    """Upload file and return public URL."""
    bucket = os.environ["R2_BUCKET"]
    base_url = os.environ["R2_PUBLIC_BASE_URL"].rstrip("/")

    _client().upload_file(
        local_path,
        bucket,
        r2_key,
        ExtraArgs={"ContentType": content_type, "CacheControl": "public, max-age=31536000"},
    )
    return f"{base_url}/{r2_key}"


def delete(r2_key: str) -> None:
    bucket = os.environ["R2_BUCKET"]
    _client().delete_object(Bucket=bucket, Key=r2_key)
