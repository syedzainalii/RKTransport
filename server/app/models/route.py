from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Route(Base, TimestampMixin):
    __tablename__ = "routes"
    __table_args__ = (
        UniqueConstraint("origin_location_id", "destination_location_id", name="uq_route_od"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    origin_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    destination_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200))
    is_core: Mapped[bool] = mapped_column(Boolean, default=False)
    base_price_aed: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    origin = relationship("Location", foreign_keys=[origin_location_id], back_populates="origins")
    destination = relationship(
        "Location", foreign_keys=[destination_location_id], back_populates="destinations"
    )
