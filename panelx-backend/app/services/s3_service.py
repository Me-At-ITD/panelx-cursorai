from __future__ import annotations

import json
import uuid
from typing import Optional

import aioboto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

# Public-read policy for the avatars prefix only (profile images)
_AVATARS_PUBLIC_POLICY = json.dumps({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"AWS": ["*"]},
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{settings.MINIO_BUCKET_NAME}/avatars/*"],
        }
    ],
})


class S3Service:
    """
    Unified S3-compatible storage service.
    Works with MinIO (local dev) and AWS S3 (production) transparently.
    Switch between them via environment variables alone.
    """

    def __init__(self) -> None:
        self._session = aioboto3.Session()
        self.bucket = settings.MINIO_BUCKET_NAME

    # ── Internal helpers ──────────────────────────────────────────────────
    def _client(self):
        """Return a configured async S3 client context manager."""
        kwargs: dict = {
            "aws_access_key_id": settings.MINIO_ACCESS_KEY,
            "aws_secret_access_key": settings.MINIO_SECRET_KEY,
            "region_name": settings.AWS_REGION,
        }
        # When using MinIO set a custom endpoint; for AWS S3 leave it unset.
        if settings.MINIO_ENDPOINT and not settings.MINIO_ENDPOINT.startswith("s3.amazonaws"):
            kwargs["endpoint_url"] = settings.s3_endpoint_url

        return self._session.client("s3", **kwargs)

    async def _ensure_bucket(self) -> None:
        """Create the bucket if it does not exist yet, then apply public-read policy for avatars."""
        async with self._client() as s3:
            try:
                await s3.head_bucket(Bucket=self.bucket)
            except ClientError as exc:
                error_code = exc.response["Error"]["Code"]
                if error_code in ("404", "NoSuchBucket"):
                    await s3.create_bucket(Bucket=self.bucket)
                else:
                    raise
            # Always ensure avatars prefix is publicly readable
            try:
                await s3.put_bucket_policy(Bucket=self.bucket, Policy=_AVATARS_PUBLIC_POLICY)
            except ClientError:
                pass  # Non-fatal: policy may already be set or permissions may differ

    # ── Public API ────────────────────────────────────────────────────────
    async def upload_file(
        self,
        file: UploadFile,
        project_id: str,
        *,
        prefix: str = "uploads",
    ) -> dict:
        """
        Stream-upload a file to S3/MinIO.

        Returns a dict with storage_key, storage_url, bucket_name, file_size.
        Raises HTTP 413 if the file exceeds MAX_FILE_SIZE_MB.
        """
        await self._ensure_bucket()

        contents = await file.read()
        file_size = len(contents)

        if file_size > settings.max_upload_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {settings.MAX_FILE_SIZE_MB} MB limit",
            )

        # Derive a unique, collision-free storage key
        extension = ""
        if file.filename and "." in file.filename:
            extension = "." + file.filename.rsplit(".", 1)[-1].lower()
        storage_key = f"{prefix}/{project_id}/{uuid.uuid4()}{extension}"
        content_type = file.content_type or "application/octet-stream"

        async with self._client() as s3:
            await s3.put_object(
                Bucket=self.bucket,
                Key=storage_key,
                Body=contents,
                ContentType=content_type,
            )

        storage_url = f"{settings.s3_endpoint_url}/{self.bucket}/{storage_key}"

        return {
            "storage_key": storage_key,
            "storage_url": storage_url,
            "bucket_name": self.bucket,
            "file_size": file_size,
        }

    async def delete_file(self, storage_key: str) -> None:
        """Delete an object from storage."""
        async with self._client() as s3:
            await s3.delete_object(Bucket=self.bucket, Key=storage_key)

    async def generate_presigned_url(
        self,
        storage_key: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate a time-limited pre-signed download URL."""
        async with self._client() as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": storage_key},
                ExpiresIn=expires_in,
            )

    async def get_file_metadata(self, storage_key: str) -> Optional[dict]:
        """Return object metadata or None if the key does not exist."""
        async with self._client() as s3:
            try:
                response = await s3.head_object(Bucket=self.bucket, Key=storage_key)
                return {
                    "content_type": response.get("ContentType"),
                    "content_length": response.get("ContentLength"),
                    "last_modified": response.get("LastModified"),
                }
            except ClientError:
                return None
