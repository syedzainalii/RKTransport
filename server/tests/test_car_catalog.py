import asyncio
import unittest

from fastapi import BackgroundTasks
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

import app.models
from app.api.v1.car_catalog import bulk_create_models, list_public_makes
from app.core.database import Base, get_db
from app.core.seed import seed_defaults
from app.models import CarMake, CarModel
from app.schemas.car_catalog import BulkCarModelsInput
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

    def test_bulk_add_skips_existing_models_and_is_safe_to_repeat(self):
        make = self.db.query(CarMake).filter(CarMake.name == "Toyota").first()
        payload = BulkCarModelsInput(models=["Corolla", "Avalon"])
        first = asyncio.run(bulk_create_models(make.id, payload, BackgroundTasks(), self.db, None))
        second = asyncio.run(bulk_create_models(make.id, payload, BackgroundTasks(), self.db, None))
        self.assertEqual([row.name for row in first], ["Avalon"])
        self.assertEqual(second, [])
        self.assertEqual(self.db.query(CarModel).filter(CarModel.make_id == make.id, CarModel.name == "Avalon").count(), 1)

    def test_public_api_lists_seeded_catalog_and_admin_list_requires_login(self):
        def override_db():
            yield self.db

        app.dependency_overrides[get_db] = override_db
        with TestClient(app) as client:
            public_response = client.get("/api/v1/car-makes")
            admin_response = client.get("/api/v1/admin/car-makes")
        self.assertEqual(public_response.status_code, 200)
        toyota = next(row for row in public_response.json() if row["name"] == "Toyota")
        self.assertIn("Corolla", [model["name"] for model in toyota["models"]])
        self.assertEqual(admin_response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
