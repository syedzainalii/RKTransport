import unittest

import app.models
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.seed import seed_defaults
from app.models import CarMake, CarModel, Faq, HeroBanner, Location, PageCopy, Route, Service, SiteSettings, User, Vehicle


class SeedDefaultsTests(unittest.TestCase):
    def test_running_seed_twice_does_not_duplicate_default_records(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        try:
            Base.metadata.create_all(engine)
            with Session(engine) as db:
                seed_defaults(db)
                first_counts = {
                    model: db.query(model).count()
                    for model in (User, SiteSettings, Location, Route, Service, PageCopy, Faq, HeroBanner, CarMake, CarModel, Vehicle)
                }

                seed_defaults(db)
                second_counts = {
                    model: db.query(model).count()
                    for model in first_counts
                }

                self.assertEqual(first_counts, second_counts)
                self.assertEqual(first_counts[User], 1)
                self.assertEqual(first_counts[SiteSettings], 1)
                self.assertEqual(first_counts[Location], 2)
                self.assertEqual(first_counts[Route], 2)
                self.assertEqual(first_counts[Service], 3)
                self.assertGreater(first_counts[PageCopy], 0)
                self.assertGreater(first_counts[Faq], 0)
                self.assertEqual(first_counts[HeroBanner], 1)
                self.assertEqual(first_counts[Vehicle], 3)
                page_copy_keys = {row.key for row in db.query(PageCopy).all()}
                self.assertTrue(
                    {
                        "packages_banner_url",
                        "carfeatures_banner_url",
                        "why_banner_url",
                        "faq_banner_url",
                    }.issubset(page_copy_keys)
                )
                self.assertGreater(first_counts[CarMake], 10)
                self.assertGreater(first_counts[CarModel], 50)
        finally:
            Base.metadata.drop_all(engine)
            engine.dispose()


if __name__ == "__main__":
    unittest.main()
