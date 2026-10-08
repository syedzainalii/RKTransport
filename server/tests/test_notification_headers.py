import os
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

os.environ["DATABASE_URL"] = "sqlite://"

from app.services import notifications


class NotificationAuthorizationTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_resend_key_fails_without_sending(self):
        with patch.object(notifications.settings, "EMAIL_PROVIDER", "resend"), patch.object(
            notifications.settings, "EMAIL_FROM", "dispatch@example.com"
        ), patch.object(notifications.settings, "RESEND_API_KEY", None), patch.object(
            notifications.httpx, "AsyncClient"
        ) as client:
            with self.assertRaisesRegex(RuntimeError, "RESEND_API_KEY is not configured"):
                await notifications._send_email("customer@example.com", "Subject", "Body")

        client.assert_not_called()

    async def test_missing_whatsapp_token_fails_without_sending(self):
        with patch.object(notifications.settings, "WHATSAPP_PROVIDER", "cloud_api"), patch.object(
            notifications.settings, "WHATSAPP_CLOUD_PHONE_NUMBER_ID", "123456"
        ), patch.object(notifications.settings, "WHATSAPP_CLOUD_ACCESS_TOKEN", None), patch.object(
            notifications.httpx, "AsyncClient"
        ) as client:
            with self.assertRaisesRegex(RuntimeError, "credentials are not configured"):
                await notifications._send_whatsapp("+971500000000", "Test body")

        client.assert_not_called()

    async def test_resend_uses_configured_bearer_token(self):
        token = "resend_test_token"
        with patch.object(notifications.settings, "EMAIL_PROVIDER", "resend"), patch.object(
            notifications.settings, "EMAIL_FROM", "dispatch@example.com"
        ), patch.object(notifications.settings, "RESEND_API_KEY", token):
            client = AsyncMock()
            client.__aenter__.return_value = client
            client.post.return_value = MagicMock()
            with patch.object(notifications.httpx, "AsyncClient", return_value=client):
                await notifications._send_email("customer@example.com", "Subject", "Body")

        client.post.assert_awaited_once_with(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "from": "dispatch@example.com",
                "to": ["customer@example.com"],
                "subject": "Subject",
                "text": "Body",
            },
        )

    async def test_whatsapp_cloud_api_uses_configured_bearer_token(self):
        token = "whatsapp_test_token"
        with patch.object(notifications.settings, "WHATSAPP_PROVIDER", "cloud_api"), patch.object(
            notifications.settings, "WHATSAPP_CLOUD_PHONE_NUMBER_ID", "123456"
        ), patch.object(notifications.settings, "WHATSAPP_CLOUD_ACCESS_TOKEN", token):
            client = AsyncMock()
            client.__aenter__.return_value = client
            client.post.return_value = MagicMock()
            with patch.object(notifications.httpx, "AsyncClient", return_value=client):
                await notifications._send_whatsapp("+971500000000", "Test body")

        client.post.assert_awaited_once_with(
            "https://graph.facebook.com/v21.0/123456/messages",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "messaging_product": "whatsapp",
                "to": "971500000000",
                "type": "text",
                "text": {"body": "Test body"},
            },
        )
