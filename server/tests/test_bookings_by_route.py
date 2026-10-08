import asyncio
import os
import unittest

os.environ["DATABASE_URL"] = "sqlite://"

import httpx
from main import app


class BookingsByRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_booking_api_routes_are_disabled(self):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = await asyncio.gather(
                client.post("/api/v1/bookings", json={}),
                client.get("/api/v1/bookings/track/RKTEST000001"),
                client.get("/api/v1/admin/bookings"),
                client.get("/api/v1/admin/bookings/by-route"),
            )
        self.assertEqual([response.status_code for response in responses], [404, 404, 404, 404])
