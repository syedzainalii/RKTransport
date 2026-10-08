"""Validate, optimize, and upload images to Cloudinary without local disk writes."""
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
logger = logging.getLogger(__name__)


class StorageNotConfigured(RuntimeError):
    """Cloudinary credentials are missing or malformed."""


def _validate(file: UploadFile) -> None:
    name = (file.filename or "").lower()
    ext = "." + name.rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ALLOWED:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(sorted(ALLOWED))}")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")


def _clean_credential(value: str | None) -> str:
    """Remove stray whitespace or quotes pasted around an environment value."""
    return (value or "").strip().strip("'\"").strip()


def _optimize(contents: bytes) -> Tuple[bytes, str, str]:
    """Resize and compress. Returns (bytes, content_type, extension).

    Images with transparency stay PNG (useful for logos); everything else becomes JPEG.
    """
    img = Image.open(io.BytesIO(contents))
    img = ImageOps.exif_transpose(img)

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
    cloud_name = _clean_credential(settings.CLOUDINARY_CLOUD_NAME)
    api_key = _clean_credential(settings.CLOUDINARY_API_KEY)
    api_secret = _clean_credential(settings.CLOUDINARY_API_SECRET)

    try:
        if not all((cloud_name, api_key, api_secret)):
            raise StorageNotConfigured("Cloudinary credentials are missing")
        url = await _cloudinary(
            filename.rsplit(".", 1)[0],
            contents,
            content_type,
            ext,
            cloud_name,
            api_key,
            api_secret,
        )
    except StorageNotConfigured as exc:
        logger.error("Image storage misconfigured: %s", exc)
        raise HTTPException(500, "Image storage is not configured") from exc
    except Exception as exc:
        logger.exception("Cloudinary image upload failed")
        raise HTTPException(502, "Image storage rejected the upload. Please try again.") from exc

    return url, len(contents), content_type


async def _cloudinary(
    public_id: str,
    contents: bytes,
    content_type: str,
    ext: str,
    cloud_name: str,
    api_key: str,
    api_secret: str,
) -> str:
    timestamp = int(time.time())
    params = f"public_id={public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.sha1(params.encode()).hexdigest()
    files = {"file": (f"image.{ext}", contents, content_type)}
    data = {
        "api_key": api_key,
        "timestamp": str(timestamp),
        "public_id": public_id,
        "signature": signature,
    }
    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(url, data=data, files=files)
    if res.status_code >= 400:
        raise RuntimeError(f"Cloudinary upload returned HTTP {res.status_code}: {res.text[:300]}")
    secure_url = res.json().get("secure_url")
    if not isinstance(secure_url, str) or not secure_url.startswith("https://"):
        raise RuntimeError("Cloudinary upload response did not include a secure image URL")
    return secure_url
