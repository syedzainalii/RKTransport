from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel, require_uae_phone


class SiteSettingsUpdate(BaseModel):
    brand_name: str | None = Field(default=None, max_length=120)
    tagline: str | None = Field(default=None, max_length=255)
    logo_url: str | None = Field(default=None, max_length=2048)
    logo_alt: str | None = Field(default=None, max_length=255)
    logo_dark_url: str | None = Field(default=None, max_length=2048)
    logo_dark_alt: str | None = Field(default=None, max_length=255)
    favicon_url: str | None = Field(default=None, max_length=2048)
    phone_primary: str | None = Field(default=None, max_length=32)
    phone_recovery: str | None = Field(default=None, max_length=32)
    whatsapp: str | None = Field(default=None, max_length=32)
    email: str | None = Field(default=None, max_length=255)
    address_line: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=120)
    emirate: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    available_24_7: bool | None = None
    hours_label: str | None = Field(default=None, max_length=80)
    timezone: str | None = Field(default=None, max_length=64)
    currency_code: str | None = Field(default=None, max_length=8)
    currency_symbol: str | None = Field(default=None, max_length=16)
    core_route_label: str | None = Field(default=None, max_length=120)
    header_cta_label: str | None = Field(default=None, max_length=80)
    header_cta_href: str | None = Field(default=None, max_length=255)
    seo_title: str | None = Field(default=None, max_length=160)
    seo_description: str | None = None
    og_image_url: str | None = Field(default=None, max_length=2048)
    footer_blurb: str | None = None
    facebook_url: str | None = Field(default=None, max_length=255)
    instagram_url: str | None = Field(default=None, max_length=255)
    tiktok_url: str | None = Field(default=None, max_length=255)
    maps_embed_url: str | None = None
    notifications_email_enabled: bool | None = None
    notifications_whatsapp_enabled: bool | None = None
    notification_admin_email: EmailStr | None = None
    notification_admin_phone: str | None = Field(default=None, max_length=32)

    def model_post_init(self, __context):
        for field in ("phone_primary", "phone_recovery", "whatsapp", "notification_admin_phone"):
            val = getattr(self, field)
            if val:
                setattr(self, field, require_uae_phone(val))

class SiteSettingsResponse(ORMModel):
    id: int
    brand_name: str
    tagline: str | None
    logo_url: str | None
    logo_alt: str | None
    logo_dark_url: str | None
    logo_dark_alt: str | None
    favicon_url: str | None
    phone_primary: str | None
    phone_recovery: str | None
    whatsapp: str | None
    email: str | None
    address_line: str | None
    city: str | None
    emirate: str | None
    country: str | None
    available_24_7: bool
    hours_label: str
    timezone: str
    currency_code: str
    currency_symbol: str
    core_route_label: str
    header_cta_label: str | None
    header_cta_href: str | None
    seo_title: str | None
    seo_description: str | None
    og_image_url: str | None
    footer_blurb: str | None
    facebook_url: str | None
    instagram_url: str | None
    tiktok_url: str | None
    maps_embed_url: str | None
    booking_time_slots: list[str]
    blocked_dates: list[str]
    created_at: datetime
    updated_at: datetime


class AdminSiteSettingsResponse(SiteSettingsResponse):
    notifications_email_enabled: bool
    notifications_whatsapp_enabled: bool
    notification_admin_email: str | None
    notification_admin_phone: str | None
