from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.mixins import TimestampMixin

JSONType = JSON().with_variant(JSONB, "postgresql")


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    seats: Mapped[str] = mapped_column(String(120))
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    chips: Mapped[list[str]] = mapped_column(JSONType, default=list)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
