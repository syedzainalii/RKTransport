from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.mixins import TimestampMixin

JSONType = JSON().with_variant(JSONB, "postgresql")


class About(Base, TimestampMixin):
    __tablename__ = "about"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text)
    mission: Mapped[str | None] = mapped_column(Text, nullable=True)
    vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    values: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    images: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    banner_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    stats: Mapped[list] = mapped_column(JSONType, default=list)
    story_image_side: Mapped[str] = mapped_column(String(8), default="left")
    why_choose_us: Mapped[list] = mapped_column(JSONType, default=list)