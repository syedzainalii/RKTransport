from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class CarModel(Base, TimestampMixin):
    __tablename__ = "car_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    make_id: Mapped[int] = mapped_column(ForeignKey("car_makes.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    default_vehicle_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("vehicle_types.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    make = relationship("CarMake", back_populates="models")
    default_vehicle_type = relationship("VehicleType")
