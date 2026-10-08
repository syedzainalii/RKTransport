from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.mixins import TimestampMixin

JSONType = JSON().with_variant(JSONB, "postgresql")


class SiteSettings(Base, TimestampMixin):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    brand_name: Mapped[str] = mapped_column(String(120), default="RK Transport")
    tagline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo_dark_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_dark_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    phone_primary: Mapped[str | None] = mapped_column(String(32), nullable=True)
    phone_recovery: Mapped[str | None] = mapped_column(String(32), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(32), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    emirate: Mapped[str | None] = mapped_column(String(120), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)

    available_24_7: Mapped[bool] = mapped_column(Boolean, default=True)
    hours_label: Mapped[str] = mapped_column(String(80), default="Available 24/7")
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Dubai")
    currency_code: Mapped[str] = mapped_column(String(8), default="AED")
    currency_symbol: Mapped[str] = mapped_column(String(16), default="AED")
    core_route_label: Mapped[str] = mapped_column(String(120), default="Dubai ⇄ Abu Dhabi")

    header_cta_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    header_cta_href: Mapped[str | None] = mapped_column(String(255), nullable=True)

    seo_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    og_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    footer_blurb: Mapped[str | None] = mapped_column(Text, nullable=True)
    facebook_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tiktok_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    maps_embed_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    notifications_email_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    notifications_whatsapp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    notification_admin_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notification_admin_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    booking_time_slots: Mapped[list] = mapped_column(JSONType, default=list)
    blocked_dates: Mapped[list] = mapped_column(JSONType, default=list)
