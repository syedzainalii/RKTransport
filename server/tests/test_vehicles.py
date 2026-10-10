import unittest

import app.models
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.models import Vehicle
from main import app


class PublicVehiclesTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)

        def override_get_db():
            with Session(self.engine) as db:
                yield db

        app.dependency_overrides[get_db] = override_get_db

    def tearDown(self):
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_public_cars_are_active_and_ordered_by_display_order(self):
        with Session(self.engine) as db:
            db.add_all(
                [
                    Vehicle(
                        title="Last",
                        slug="last",
                        description="Last in order",
                        seats="4",
                        chips=["AC"],
                        display_order=3,
                        is_active=True,
                    ),
                    Vehicle(
                        title="First",
                        slug="first",
                        description="First in order",
                        seats="6",
                        chips=["AC", "Luggage"],
                        display_order=1,
                        is_active=True,
                    ),
                    Vehicle(
                        title="Hidden",
                        slug="hidden",
                        description="Not public",
                        seats="2",
                        chips=[],
                        display_order=0,
                        is_active=False,
                    ),
                ]
            )
            db.commit()

        with TestClient(app) as client:
            response = client.get("/api/v1/cars")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["title"] for item in response.json()], ["First", "Last"])
        self.assertEqual(response.json()[0]["chips"], ["AC", "Luggage"])
        self.assertEqual(response.json()[0]["slug"], "first")


if __name__ == "__main__":
    unittest.main()
