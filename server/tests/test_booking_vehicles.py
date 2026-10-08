import unittest

from pydantic import ValidationError

from app.schemas.booking import BookingCreate


def vehicle(index: int = 1) -> dict:
    return {
        "make": " Toyota ",
        "model": "Land Cruiser",
        "year": 2021,
        "colour": " White ",
        "plate": "A 12345",
        "vehicle_type_id": index,
        "runs": False,
        "photo_url": None,
        "photo_urls": [],
    }


class BookingVehicleValidationTests(unittest.TestCase):
    def payload(self, **changes) -> dict:
        return {
            "type": "transport",
            "customer_name": "Customer Name",
            "customer_phone": "+971501234567",
            "pickup_location_id": 1,
            "dropoff_location_id": 2,
            "vehicles": [vehicle()],
            **changes,
        }

    def test_trims_and_sanitizes_vehicle_text(self):
        result = BookingCreate.model_validate(self.payload())
        self.assertEqual(result.vehicles[0].make, "Toyota")
        self.assertEqual(result.vehicles[0].colour, "White")

    def test_rejects_year_before_1990(self):
        data = self.payload()
        data["vehicles"] = [vehicle() | {"year": 1989}]
        with self.assertRaises(ValidationError):
            BookingCreate.model_validate(data)

    def test_recovery_requires_runs_answer(self):
        data = self.payload(type="recovery", pickup_address="Dubai Marina")
        data["vehicles"] = [vehicle() | {"runs": None}]
        with self.assertRaisesRegex(ValidationError, "starts and drives"):
            BookingCreate.model_validate(data)

    def test_rejects_more_than_five_vehicles(self):
        data = self.payload()
        data["vehicles"] = [vehicle(index) for index in range(1, 7)]
        with self.assertRaises(ValidationError):
            BookingCreate.model_validate(data)

    def test_legacy_single_vehicle_payload_remains_accepted(self):
        data = self.payload()
        data.pop("vehicles")
        data.update(vehicle_make="Toyota", vehicle_model="Camry", vehicle_type_id=1)
        BookingCreate.model_validate(data)


if __name__ == "__main__":
    unittest.main()
