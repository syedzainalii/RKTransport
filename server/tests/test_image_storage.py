import hashlib
import io
import os
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException
from PIL import Image

os.environ["DATABASE_URL"] = "sqlite://"

from app.services import image_storage


def jpeg_upload() -> image_storage.UploadFile:
    image = Image.new("RGB", (4, 4), (20, 40, 60))
    contents = io.BytesIO()
    image.save(contents, format="JPEG")
    return image_storage.UploadFile(filename="car.jpg", file=io.BytesIO(contents.getvalue()))


class ImageStorageTests(unittest.IsolatedAsyncioTestCase):
    async def test_cloudinary_request_uses_credentials_and_signed_upload_parameters(self):
        response = MagicMock(status_code=200)
        response.json.return_value = {"secure_url": "https://res.cloudinary.com/example/car.jpg"}
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.post.return_value = response

        with patch.object(image_storage.time, "time", return_value=1234), patch.object(
            image_storage.httpx, "AsyncClient", return_value=client
        ):
            result = await image_storage._cloudinary(
                "banners/car",
                b"image-bytes",
                "image/jpeg",
                "jpg",
                "cloud",
                "key",
                "secret",
            )

        signature = hashlib.sha1(b"public_id=banners/car&timestamp=1234secret").hexdigest()
        self.assertEqual(result, "https://res.cloudinary.com/example/car.jpg")
        client.post.assert_awaited_once()
        args, kwargs = client.post.await_args
        self.assertEqual(args[0], "https://api.cloudinary.com/v1_1/cloud/image/upload")
        self.assertEqual(kwargs["data"], {
            "api_key": "key",
            "timestamp": "1234",
            "public_id": "banners/car",
            "signature": signature,
        })
        self.assertEqual(kwargs["files"]["file"], ("image.jpg", b"image-bytes", "image/jpeg"))

    async def test_upload_cleans_credentials_and_uses_cloudinary(self):
        with patch.object(image_storage.settings, "CLOUDINARY_CLOUD_NAME", " cloud "), patch.object(
            image_storage.settings, "CLOUDINARY_API_KEY", " 'key' "
        ), patch.object(image_storage.settings, "CLOUDINARY_API_SECRET", " 'secret' "), patch.object(
            image_storage, "_cloudinary", new_callable=AsyncMock, return_value="https://res.cloudinary.com/cloud/car.jpg"
        ) as upload:
            result = await image_storage.upload_image(jpeg_upload(), "hero")

        self.assertEqual(result[0], "https://res.cloudinary.com/cloud/car.jpg")
        args = upload.await_args.args
        self.assertTrue(args[0].startswith("hero/"))
        self.assertEqual(args[4:], ("cloud", "key", "secret"))

    async def test_invalid_image_is_rejected_with_a_safe_message(self):
        upload = image_storage.UploadFile(filename="car.jpg", file=io.BytesIO(b"not-an-image"))
        with self.assertRaises(HTTPException) as raised:
            await image_storage.upload_image(upload)

        self.assertEqual(raised.exception.status_code, 400)
        self.assertIn("could not be processed", raised.exception.detail)

    async def test_missing_cloudinary_configuration_returns_safe_error(self):
        with patch.object(image_storage.settings, "CLOUDINARY_CLOUD_NAME", None), patch.object(
            image_storage.settings, "CLOUDINARY_API_KEY", None
        ), patch.object(image_storage.settings, "CLOUDINARY_API_SECRET", None):
            with self.assertRaises(HTTPException) as raised:
                await image_storage.upload_image(jpeg_upload())

        self.assertEqual(raised.exception.status_code, 500)
        self.assertEqual(raised.exception.detail, "Image storage is not configured")
