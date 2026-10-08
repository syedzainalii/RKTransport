import asyncio
import os
import unittest

os.environ["DATABASE_URL"] = "sqlite://"

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from main import app
from app.core.database import Base
from app.models.booking import Booking
from app.models.location import Location
from app.api.v1.bookings import bookings_by_route


class BookingsByRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_route_aggregate_requires_admin_authentication(self):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/admin/bookings/by-route")
        self.assertEqual(response.status_code, 401)

    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_aggregates_bookings_using_location_names(self):
        dubai = Location(name="Dubai", slug="dubai")
        abu_dhabi = Location(name="Abu Dhabi", slug="abu-dhabi")
        self.db.add_all([dubai, abu_dhabi])
        self.db.flush()
        self.db.add_all([
            Booking(
                ref="RKTEST000001",
                type="transport",
                customer_name="First Customer",
                customer_phone="+971500000001",
                pickup_location_id=dubai.id,
                dropoff_location_id=abu_dhabi.id,
            ),
            Booking(
                ref="RKTEST000002",
                type="transport",
                customer_name="Second Customer",
                customer_phone="+971500000002",
                pickup_location_id=dubai.id,
                dropoff_location_id=abu_dhabi.id,
            ),
        ])
        self.db.commit()

        result = asyncio.run(bookings_by_route(self.db, None))

        self.assertEqual(result, [{"label": "Dubai → Abu Dhabi", "total": 2}])
