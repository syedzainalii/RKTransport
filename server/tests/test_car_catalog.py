import asyncio
import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

import app.models
from app.api.v1.car_catalog import list_public_makes
from app.core.database import Base, get_db
from app.core.seed import seed_defaults
from app.models import CarMake, CarModel
from main import app


class CarCatalogTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        seed_defaults(self.db)

    def tearDown(self):
        app.dependency_overrides.pop(get_db, None)
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_public_list_contains_active_seeded_models_only(self):
        make = self.db.query(CarMake).filter(CarMake.name == "Toyota").first()
        hidden = self.db.query(CarModel).filter(CarModel.make_id == make.id, CarModel.name == "Camry").first()
        hidden.is_active = False
        self.db.commit()

        makes = asyncio.run(list_public_makes(self.db))
        toyota = next(row for row in makes if row["name"] == "Toyota")
        model_names = [model.name for model in toyota["models"]]
        self.assertIn("Corolla", model_names)
        self.assertNotIn("Camry", model_names)

    def test_public_api_lists_seeded_catalog_and_admin_management_is_removed(self):
        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        with TestClient(app) as client:
            public_response = client.get("/api/v1/car-makes")
            admin_response = client.get("/api/v1/admin/car-makes")
            admin_write_response = client.post("/api/v1/admin/car-makes", json={"name": "New Make"})
            booking_option_admin_paths = [
                "/api/v1/admin/locations",
                "/api/v1/admin/routes",
                "/api/v1/admin/vehicle-types",
                "/api/v1/admin/storage-plans",
            ]
            booking_option_admin_responses = [
                client.get(path) for path in booking_option_admin_paths
            ]
        self.assertEqual(public_response.status_code, 200)
        toyota = next(row for row in public_response.json() if row["name"] == "Toyota")
        self.assertIn("Corolla", [model["name"] for model in toyota["models"]])
        self.assertEqual(admin_response.status_code, 404)
        self.assertEqual(admin_write_response.status_code, 404)
        self.assertTrue(all(response.status_code == 404 for response in booking_option_admin_responses))


if __name__ == "__main__":
    unittest.main()
