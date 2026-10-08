from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ref: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(24), index=True)  # transport | recovery | storage
    status: Mapped[str] = mapped_column(String(24), default="new", index=True)

    customer_name: Mapped[str] = mapped_column(String(160))
    customer_phone: Mapped[str] = mapped_column(String(32))
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    pickup_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    dropoff_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    pickup_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    dropoff_address: Mapped[str | None] = mapped_column(Text, nullable=True)

    vehicle_type_id: Mapped[int | None] = mapped_column(ForeignKey("vehicle_types.id"), nullable=True)
    vehicle_make: Mapped[str | None] = mapped_column(String(80), nullable=True)
    vehicle_model: Mapped[str | None] = mapped_column(String(80), nullable=True)
    vehicle_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    plate_number: Mapped[str | None] = mapped_column(String(32), nullable=True)

    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    storage_plan_id: Mapped[int | None] = mapped_column(ForeignKey("storage_plans.id"), nullable=True)
    storage_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    storage_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    quoted_amount_aed: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(24), default="web")

    pickup_location = relationship("Location", foreign_keys=[pickup_location_id])
    dropoff_location = relationship("Location", foreign_keys=[dropoff_location_id])
    vehicle_type = relationship("VehicleType", back_populates="bookings")
    storage_plan = relationship("StoragePlan", back_populates="bookings")
