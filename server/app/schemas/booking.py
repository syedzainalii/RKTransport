from datetime import date, datetime
from decimal import Decimal
import re

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.schemas.common import ORMModel, require_uae_phone


class BookingVehicle(BaseModel):
    make: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    year: int = Field(ge=1990, le=datetime.now().year)
    colour: str | None = Field(default=None, max_length=50)
    plate: str | None = Field(default=None, max_length=32)
    vehicle_type_id: int = Field(gt=0)
    runs: bool | None = None
    photo_url: str | None = Field(default=None, max_length=2048)
    photo_urls: list[str] = Field(default_factory=list, max_length=2)

    @field_validator("make", "model", "colour", "plate", mode="before")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return None
        cleaned = re.sub(r"[\x00-\x1f\x7f]", "", str(value)).strip()
        return cleaned or None

    @field_validator("photo_url")
    @classmethod
    def valid_photo_url(cls, value: str | None) -> str | None:
        if value is not None and not value.startswith("https://"):
            raise ValueError("Photo must be uploaded before submitting")
        return value

    @field_validator("photo_urls")
    @classmethod
    def valid_photo_urls(cls, values: list[str]) -> list[str]:
        if any(not value.startswith("https://") for value in values):
            raise ValueError("Photos must be uploaded before submitting")
        return values


class BookingCreate(BaseModel):
    type: str = Field(pattern="^(transport|recovery|storage)$")
    customer_name: str = Field(min_length=2, max_length=160)
    customer_phone: str = Field(max_length=32)
    customer_email: EmailStr | None = None
    pickup_location_id: int | None = Field(default=None, gt=0)
    dropoff_location_id: int | None = Field(default=None, gt=0)
    pickup_address: str | None = Field(default=None, max_length=2000)
    dropoff_address: str | None = Field(default=None, max_length=2000)
    vehicle_type_id: int | None = Field(default=None, gt=0)
    vehicle_make: str | None = Field(default=None, max_length=80)
    vehicle_model: str | None = Field(default=None, max_length=80)
    vehicle_year: int | None = Field(default=None, ge=1900, le=2100)
    plate_number: str | None = Field(default=None, max_length=32)
    vehicles: list["BookingVehicle"] = Field(default_factory=list, max_length=5)
    scheduled_at: datetime | None = None
    storage_plan_id: int | None = Field(default=None, gt=0)
    storage_start_date: date | None = None
    storage_end_date: date | None = None
    notes: str | None = Field(default=None, max_length=5000)
    source: str = Field(default="web", pattern="^web$")

    @field_validator("customer_phone")
    @classmethod
    def phone(cls, v: str) -> str:
        return require_uae_phone(v)

    @model_validator(mode="after")
    def validate_service_details(self):
        if self.type == "recovery" and self.vehicles and any(vehicle.runs is None for vehicle in self.vehicles):
            raise ValueError("Tell us whether each car starts and drives for recovery bookings")
        if self.type == "transport" and (
            self.pickup_location_id is None or self.dropoff_location_id is None
        ):
            raise ValueError("Pickup and drop-off locations are required for transport bookings")
        if self.type == "recovery" and not self.pickup_address:
            raise ValueError("Recovery location is required")
        if self.type == "storage":
            if self.storage_plan_id is None or self.storage_start_date is None:
                raise ValueError("Storage plan and start date are required")
            if self.storage_end_date and self.storage_end_date < self.storage_start_date:
                raise ValueError("Storage end date must be on or after the start date")
        return self


class BookingAdminUpdate(BaseModel):
    status: str | None = Field(default=None, pattern="^(new|quoted|confirmed|in_progress|completed|cancelled)$")
    quoted_amount_aed: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    admin_notes: str | None = Field(default=None, max_length=5000)
    scheduled_at: datetime | None = None


class BookingResponse(ORMModel):
    id: int
    ref: str
    type: str
    status: str
    customer_name: str
    customer_phone: str
    customer_email: str | None
    pickup_location_id: int | None
    dropoff_location_id: int | None
    pickup_address: str | None
    dropoff_address: str | None
    vehicle_type_id: int | None
    vehicle_make: str | None
    vehicle_model: str | None
    vehicle_year: int | None
    plate_number: str | None
    vehicles: list[BookingVehicle] | None
    scheduled_at: datetime | None
    storage_plan_id: int | None
    storage_start_date: date | None
    storage_end_date: date | None
    quoted_amount_aed: Decimal | None
    notes: str | None
    admin_notes: str | None = None
    source: str
    created_at: datetime
    updated_at: datetime


class PublicBookingResponse(ORMModel):
    ref: str
    type: str
    status: str
    scheduled_at: datetime | None
    created_at: datetime
    vehicles: list[BookingVehicle] | None
    vehicle_make: str | None
    vehicle_model: str | None
    vehicle_year: int | None
    plate_number: str | None


class InquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(max_length=32)
    email: EmailStr | None = None
    subject: str | None = Field(default=None, max_length=200)
    message: str = Field(min_length=4, max_length=10000)

    @field_validator("phone")
    @classmethod
    def phone_ok(cls, v: str) -> str:
        return require_uae_phone(v)


class InquiryStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|read|replied|archived)$")


class InquiryResponse(ORMModel):
    id: int
    name: str
    phone: str
    email: str | None
    subject: str | None
    message: str
    status: str
    created_at: datetime
