"""Upload images to Vercel Blob or Cloudinary. No local disk writes."""
import asyncio
import hashlib
import io
import logging
import re
import time
from typing import Tuple

import httpx
from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps

from app.core.config import settings

ALLOWED = {".jpg", ".jpeg", ".png", ".webp"}
MAX_WIDTH = 1920
BLOB_TOKEN_PREFIX = "vercel_blob_rw_"
logger = logging.getLogger(__name__)


class StorageNotConfigured(RuntimeError):
    """Storage credentials are missing or malformed."""


def _validate(file: UploadFile) -> None:
    name = (file.filename or "").lower()
    ext = "." + name.rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ALLOWED:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(sorted(ALLOWED))}")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")


def _clean_token(value: str | None) -> str:
    """Remove stray whitespace or quotes that sneak in when pasting env values."""
    return (value or "").strip().strip("'\"").strip()


def _optimize(contents: bytes) -> Tuple[bytes, str, str]:
    """Resize and compress. Returns (bytes, content_type, extension).

    Images with transparency stay PNG (useful for logos); everything else becomes JPEG.
    """
    img = Image.open(io.BytesIO(contents))
    img = ImageOps.exif_transpose(img)  # fix sideways phone photos

    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)

    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.Resampling.LANCZOS)

    out = io.BytesIO()
    if has_alpha:
        img.convert("RGBA").save(out, format="PNG", optimize=True)
        return out.getvalue(), "image/png", "png"

    img.convert("RGB").save(out, format="JPEG", quality=85, optimize=True)
    return out.getvalue(), "image/jpeg", "jpg"


async def upload_image(file: UploadFile, folder: str = "general") -> Tuple[str, int, str]:
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", folder):
        raise HTTPException(400, "Folder may contain only letters, numbers, hyphens, and underscores")
    _validate(file)

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(raw) > settings.MAX_FILE_SIZE:
        limit_mb = settings.MAX_FILE_SIZE / 1_000_000
        raise HTTPException(400, f"Image is too large. Please choose an image under {limit_mb:.0f} MB.")

    try:
        contents, content_type, ext = await asyncio.to_thread(_optimize, raw)
    except Exception as exc:
        logger.exception("Uploaded image could not be processed")
        raise HTTPException(
            400, "Image could not be processed. Please choose a JPG, PNG, or WebP image."
        ) from exc

    filename = f"{folder}/{int(time.time())}-{hashlib.sha1(contents[:64]).hexdigest()[:10]}.{ext}"

    blob_token = _clean_token(settings.BLOB_READ_WRITE_TOKEN)
    cloudinary_ready = all(
        (settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET)
    )

    try:
        if blob_token:
            url = await _vercel_blob(filename, contents, content_type, blob_token)
        elif cloudinary_ready:
            url = await _cloudinary(filename.rsplit(".", 1)[0], contents, content_type, ext)
        else:
            raise StorageNotConfigured("No BLOB_READ_WRITE_TOKEN or Cloudinary credentials set")
    except StorageNotConfigured as exc:
        logger.error("Image storage misconfigured: %s", exc)
        raise HTTPException(500, "Image storage is not configured") from exc
    except Exception as exc:
        logger.exception("Image upload provider failed")
        raise HTTPException(502, "Image storage rejected the upload. Please try again.") from exc

    return url, len(contents), content_type


async def _vercel_blob(pathname: str, contents: bytes, content_type: str, token: str) -> str:
    if not token.startswith(BLOB_TOKEN_PREFIX):
        raise StorageNotConfigured(
            "BLOB_READ_WRITE_TOKEN does not look like a Vercel Blob read-write token "
            f"(expected it to start with '{BLOB_TOKEN_PREFIX}'). Connect a Blob store to this project."
        )

    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.put(
            f"https://blob.vercel-storage.com/{pathname}",
            content=contents,
            headers={
                "Authorization": f"Bearer {token}",
                "x-api-version": "7",
                "x-content-type": content_type,
                "x-add-random-suffix": "1",
                "x-cache-control-max-age": "31536000",
            },
        )

    if res.status_code >= 400:
        # The response body never contains the token, so it is safe to log.
        raise RuntimeError(f"Blob upload returned HTTP {res.status_code}: {res.text[:300]}")

    data = res.json()
    url = data.get("url") or data.get("downloadUrl")
    if not url:
        raise RuntimeError("Blob upload response did not include an image URL")
    return url


async def _cloudinary(public_id: str, contents: bytes, content_type: str, ext: str) -> str:
    timestamp = int(time.time())
    params = f"public_id={public_id}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
    signature = hashlib.sha1(params.encode()).hexdigest()
    files = {"file": (f"image.{ext}", contents, content_type)}
    data = {
        "api_key": settings.CLOUDINARY_API_KEY,
        "timestamp": str(timestamp),
        "public_id": public_id,
        "signature": signature,
    }
    url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/image/upload"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(url, data=data, files=files)
    if res.status_code >= 400:
        raise RuntimeError(f"Cloudinary upload returned HTTP {res.status_code}: {res.text[:300]}")
    return res.json()["secure_url"]