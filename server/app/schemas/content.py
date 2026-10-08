from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class HeroBannerIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=10000)
    badge_text: str | None = Field(default=None, max_length=80)
    button_text: str | None = Field(default=None, max_length=80)
    button_link: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=2048)
    image_alt: str | None = Field(default=None, max_length=255)
    portrait_image_url: str | None = Field(default=None, max_length=2048)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class HeroBannerResponse(HeroBannerIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class ServiceIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    short_description: str | None = Field(default=None, max_length=5000)
    detailed_description: str | None = Field(default=None, max_length=20000)
    starting_price_note: str | None = Field(default=None, max_length=120)
    features: list[str] | None = Field(default=None, max_length=50)
    gallery: list[dict[str, str | None]] = Field(default_factory=list, max_length=30)
    image_url: str | None = Field(default=None, max_length=2048)
    image_alt: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=80)
    seo_title: str | None = Field(default=None, max_length=160)
    seo_description: str | None = Field(default=None, max_length=5000)
    category: str = Field(default="other", max_length=32)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class ServiceResponse(ServiceIn, ORMModel):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class LocationIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    emirate: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=5000)
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    is_hub: bool = False
    pickup_enabled: bool = True
    dropoff_enabled: bool = True
    notes: str | None = None
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class LocationResponse(LocationIn, ORMModel):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class RouteIn(BaseModel):
    origin_location_id: int = Field(gt=0)
    destination_location_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=200)
    is_core: bool = False
    base_price_aed: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    eta_minutes: int | None = Field(default=None, gt=0)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0)


class RouteResponse(RouteIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
    origin: LocationResponse | None = None
    destination: LocationResponse | None = None


class VehicleTypeIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=2048)
    image_alt: str | None = Field(default=None, max_length=255)
    surcharge_aed: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class VehicleTypeResponse(VehicleTypeIn, ORMModel):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class StoragePlanIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    billing_period: str = Field(default="month", max_length=16)
    price_aed: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    features: list[str] | None = Field(default=None, max_length=50)
    covered: bool = True
    image_url: str | None = Field(default=None, max_length=2048)
    image_alt: str | None = Field(default=None, max_length=255)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class StoragePlanResponse(StoragePlanIn, ORMModel):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class AboutIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=1, max_length=20000)
    mission: str | None = None
    vision: str | None = None
    values: list[dict] | None = None
    images: list[dict] | None = None
    stats: list[dict] = Field(default_factory=list, max_length=20)
    story_image_side: str = Field(default="left", pattern="^(left|right)$")
    why_choose_us: list[dict] = Field(default_factory=list, max_length=30)


class AboutResponse(AboutIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class FaqIn(BaseModel):
    question: str = Field(min_length=1, max_length=400)
    answer: str = Field(min_length=1, max_length=10000)
    page_key: str | None = Field(default=None, max_length=80)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class FaqResponse(FaqIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class TestimonialIn(BaseModel):
    customer_name: str = Field(min_length=1, max_length=160)
    quote: str = Field(min_length=1, max_length=10000)
    rating: int = Field(default=5, ge=1, le=5)
    vehicle_note: str | None = Field(default=None, max_length=160)
    image_url: str | None = Field(default=None, max_length=2048)
    image_alt: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0)


class TestimonialResponse(TestimonialIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class PageCopyIn(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    value: str = Field(max_length=50000)


class PageCopyResponse(PageCopyIn, ORMModel):
    id: int
    updated_at: datetime


class MediaResponse(ORMModel):
    id: int
    url: str
    alt: str | None
    filename: str | None
    content_type: str | None
    byte_size: int | None
    folder: str | None
    created_at: datetime
