import io
import os
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

os.environ["DATABASE_URL"] = "sqlite://"

from app.services import blob_storage


class BlobStorageTests(unittest.IsolatedAsyncioTestCase):
    async def test_vercel_blob_uses_configured_bearer_token(self):
        token = "blob_test_token"
        response = MagicMock(status_code=200)
        response.json.return_value = {"url": "https://images.example.test/car.jpg"}
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.put.return_value = response

        with patch.object(blob_storage.settings, "BLOB_READ_WRITE_TOKEN", token), patch.object(
            blob_storage.httpx, "AsyncClient", return_value=client
        ):
            url = await blob_storage._vercel_blob("brand/car.jpg", b"image-bytes", "image/jpeg")

        self.assertEqual(url, "https://images.example.test/car.jpg")
        client.put.assert_awaited_once_with(
            "https://blob.vercel-storage.com/brand/car.jpg",
            content=b"image-bytes",
            headers={
                "Authorization": f"Bearer {token}",
                "x-api-version": "7",
                "x-content-type": "image/jpeg",
            },
        )

    async def test_invalid_image_is_rejected_with_a_safe_message(self):
        upload = blob_storage.UploadFile(filename="car.jpg", file=io.BytesIO(b"not-an-image"))
        with patch.object(blob_storage.settings, "BLOB_READ_WRITE_TOKEN", None), patch.object(
            blob_storage.settings, "CLOUDINARY_CLOUD_NAME", None
        ), patch.object(blob_storage.settings, "CLOUDINARY_API_KEY", None), patch.object(
            blob_storage.settings, "CLOUDINARY_API_SECRET", None
        ):
            with self.assertRaises(HTTPException) as raised:
                await blob_storage.upload_image(upload)

        self.assertEqual(raised.exception.status_code, 400)
        self.assertIn("could not be processed", raised.exception.detail)

    async def test_missing_image_storage_configuration_returns_safe_error(self):
        from PIL import Image

        image = Image.new("RGB", (2, 2), (20, 40, 60))
        contents = io.BytesIO()
        image.save(contents, format="JPEG")
        upload = blob_storage.UploadFile(filename="car.jpg", file=io.BytesIO(contents.getvalue()))
        with patch.object(blob_storage.settings, "BLOB_READ_WRITE_TOKEN", None), patch.object(
            blob_storage.settings, "CLOUDINARY_CLOUD_NAME", None
        ), patch.object(blob_storage.settings, "CLOUDINARY_API_KEY", None), patch.object(
            blob_storage.settings, "CLOUDINARY_API_SECRET", None
        ):
            with self.assertRaises(HTTPException) as raised:
                await blob_storage.upload_image(upload)

        self.assertEqual(raised.exception.status_code, 500)
        self.assertEqual(raised.exception.detail, "Image storage is not configured")
