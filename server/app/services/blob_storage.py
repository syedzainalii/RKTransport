"""Upload images to Vercel Blob or Cloudinary. No local disk writes."""
import hashlib
import io
import logging
import re
import time
from typing import Tuple

import httpx
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.core.config import settings

ALLOWED = {".jpg", ".jpeg", ".png", ".webp"}
logger = logging.getLogger(__name__)


def _validate(file: UploadFile) -> None:
    name = (file.filename or "").lower()
    ext = "." + name.rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ALLOWED:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(sorted(ALLOWED))}")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")


def _optimize(contents: bytes) -> Tuple[bytes, str]:
    img = Image.open(io.BytesIO(contents))
    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")
    max_width = 1600
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=85, optimize=True)
    return out.getvalue(), "image/jpeg"


async def upload_image(file: UploadFile, folder: str = "general") -> Tuple[str, int, str]:
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", folder):
        raise HTTPException(400, "Folder may contain only letters, numbers, hyphens, and underscores")
    _validate(file)
    raw = await file.read()
    if len(raw) > settings.MAX_FILE_SIZE:
        raise HTTPException(400, "Image is too large. Please choose an image under 4 MB.")
    try:
        contents, content_type = _optimize(raw)
    except Exception as exc:
        logger.exception("Uploaded image could not be processed")
        raise HTTPException(400, "Image could not be processed. Please choose a JPG, PNG, or WebP image.") from exc

    filename = f"{folder}/{int(time.time())}-{hashlib.sha1(contents[:64]).hexdigest()[:10]}.jpg"

    if not settings.BLOB_READ_WRITE_TOKEN and not all(
        (settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET)
    ):
        raise HTTPException(
            500,
            "Image storage is not configured",
        )
    try:
        if settings.BLOB_READ_WRITE_TOKEN:
            url = await _vercel_blob(filename, contents, content_type)
        else:
            url = await _cloudinary(filename, contents)
    except Exception as exc:
        logger.exception("Image upload provider failed")
        raise HTTPException(500, "Image storage is not configured") from exc
    return url, len(contents), content_type


async def _vercel_blob(pathname: str, contents: bytes, content_type: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.put(
            f"https://blob.vercel-storage.com/{pathname}",
            content=contents,
            headers={
                "Authorization": f"Bearer {settings.BLOB_READ_WRITE_TOKEN}",
                "x-api-version": "7",
                "x-content-type": content_type,
            },
        )
    if res.status_code >= 400:
        raise RuntimeError(f"Blob upload returned HTTP {res.status_code}: {res.text}")
    data = res.json()
    url = data.get("url") or data.get("downloadUrl")
    if not url:
        raise RuntimeError("Blob upload response did not include an image URL")
    return url


async def _cloudinary(public_id: str, contents: bytes) -> str:
    timestamp = int(time.time())
    params = f"public_id={public_id}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
    signature = hashlib.sha1(params.encode()).hexdigest()
    files = {"file": ("image.jpg", contents, "image/jpeg")}
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
        raise RuntimeError(f"Cloudinary upload returned HTTP {res.status_code}: {res.text}")
    return res.json()["secure_url"]
