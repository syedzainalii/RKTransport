from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.mixins import TimestampMixin

JSONType = JSON().with_variant(JSONB, "postgresql")


class StoragePlan(Base, TimestampMixin):
    __tablename__ = "storage_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    billing_period: Mapped[str] = mapped_column(String(16), default="month")
    price_aed: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    features: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    covered: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="storage_plan")
