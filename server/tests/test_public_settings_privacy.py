import asyncio
import os
import unittest

os.environ["DATABASE_URL"] = "sqlite://"

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.database import Base
from app.models.settings import SiteSettings
from main import app


class PublicSettingsPrivacyTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.db.add(SiteSettings(
            id=1,
            brand_name="RK Transport",
            notifications_email_enabled=True,
            notifications_whatsapp_enabled=True,
            notification_admin_email="private@example.com",
            notification_admin_phone="+971500000000",
            booking_time_slots=[],
            blocked_dates=[],
        ))
        self.db.commit()

        def override_get_db():
            yield self.db

        app.dependency_overrides[get_db] = override_get_db
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        )

    async def asyncTearDown(self):
        await self.client.aclose()
        app.dependency_overrides.pop(get_db, None)
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    async def test_public_settings_omits_admin_notification_fields(self):
        response = await self.client.get("/api/v1/settings")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertNotIn("notification_admin_email", data)
        self.assertNotIn("notification_admin_phone", data)
        self.assertNotIn("notifications_email_enabled", data)
        self.assertNotIn("notifications_whatsapp_enabled", data)

    async def test_admin_settings_requires_authentication(self):
        response = await self.client.get("/api/v1/admin/settings")

        self.assertEqual(response.status_code, 401)
