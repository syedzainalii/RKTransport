"""initial rk transport schema

Revision ID: 001
Revises:
Create Date: 2026-10-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _json():
    return sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("brand_name", sa.String(120), nullable=False, server_default="RK Transport"),
        sa.Column("tagline", sa.String(255)),
        sa.Column("logo_url", sa.Text()),
        sa.Column("logo_dark_url", sa.Text()),
        sa.Column("favicon_url", sa.Text()),
        sa.Column("phone_primary", sa.String(32)),
        sa.Column("phone_recovery", sa.String(32)),
        sa.Column("whatsapp", sa.String(32)),
        sa.Column("email", sa.String(255)),
        sa.Column("address_line", sa.String(255)),
        sa.Column("city", sa.String(120)),
        sa.Column("emirate", sa.String(120)),
        sa.Column("country", sa.String(120)),
        sa.Column("available_24_7", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("hours_label", sa.String(80), nullable=False, server_default="Available 24/7"),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="Asia/Dubai"),
        sa.Column("currency_code", sa.String(8), nullable=False, server_default="AED"),
        sa.Column("currency_symbol", sa.String(16), nullable=False, server_default="AED"),
        sa.Column("core_route_label", sa.String(120), nullable=False, server_default="Dubai ⇄ Abu Dhabi"),
        sa.Column("header_cta_label", sa.String(80)),
        sa.Column("header_cta_href", sa.String(255)),
        sa.Column("seo_title", sa.String(160)),
        sa.Column("seo_description", sa.Text()),
        sa.Column("og_image_url", sa.Text()),
        sa.Column("footer_blurb", sa.Text()),
        sa.Column("facebook_url", sa.String(255)),
        sa.Column("instagram_url", sa.String(255)),
        sa.Column("tiktok_url", sa.String(255)),
        sa.Column("maps_embed_url", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "hero_banners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("subtitle", sa.String(255)),
        sa.Column("description", sa.Text()),
        sa.Column("badge_text", sa.String(80)),
        sa.Column("button_text", sa.String(80)),
        sa.Column("button_link", sa.String(255)),
        sa.Column("image_url", sa.Text()),
        sa.Column("image_alt", sa.String(255)),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("short_description", sa.Text()),
        sa.Column("detailed_description", sa.Text()),
        sa.Column("features", _json()),
        sa.Column("image_url", sa.Text()),
        sa.Column("image_alt", sa.String(255)),
        sa.Column("icon", sa.String(80)),
        sa.Column("category", sa.String(32), server_default="other"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_services_slug", "services", ["slug"], unique=True)

    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("emirate", sa.String(80)),
        sa.Column("address", sa.Text()),
        sa.Column("lat", sa.Float()),
        sa.Column("lng", sa.Float()),
        sa.Column("is_hub", sa.Boolean(), server_default=sa.false()),
        sa.Column("notes", sa.Text()),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_locations_slug", "locations", ["slug"], unique=True)

    op.create_table(
        "routes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("origin_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("destination_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("is_core", sa.Boolean(), server_default=sa.false()),
        sa.Column("base_price_aed", sa.Numeric(12, 2)),
        sa.Column("eta_minutes", sa.Integer()),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("origin_location_id", "destination_location_id", name="uq_route_od"),
    )

    op.create_table(
        "vehicle_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.Text()),
        sa.Column("image_alt", sa.String(255)),
        sa.Column("surcharge_aed", sa.Numeric(12, 2), server_default="0"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_vehicle_types_slug", "vehicle_types", ["slug"], unique=True)

    op.create_table(
        "storage_plans",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("billing_period", sa.String(16), server_default="month"),
        sa.Column("price_aed", sa.Numeric(12, 2), server_default="0"),
        sa.Column("features", _json()),
        sa.Column("covered", sa.Boolean(), server_default=sa.true()),
        sa.Column("image_url", sa.Text()),
        sa.Column("image_alt", sa.String(255)),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_storage_plans_slug", "storage_plans", ["slug"], unique=True)

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ref", sa.String(32), nullable=False),
        sa.Column("type", sa.String(24), nullable=False),
        sa.Column("status", sa.String(24), server_default="new"),
        sa.Column("customer_name", sa.String(160), nullable=False),
        sa.Column("customer_phone", sa.String(32), nullable=False),
        sa.Column("customer_email", sa.String(255)),
        sa.Column("pickup_location_id", sa.Integer(), sa.ForeignKey("locations.id")),
        sa.Column("dropoff_location_id", sa.Integer(), sa.ForeignKey("locations.id")),
        sa.Column("pickup_address", sa.Text()),
        sa.Column("dropoff_address", sa.Text()),
        sa.Column("vehicle_type_id", sa.Integer(), sa.ForeignKey("vehicle_types.id")),
        sa.Column("vehicle_make", sa.String(80)),
        sa.Column("vehicle_model", sa.String(80)),
        sa.Column("vehicle_year", sa.Integer()),
        sa.Column("plate_number", sa.String(32)),
        sa.Column("scheduled_at", sa.DateTime(timezone=True)),
        sa.Column("storage_plan_id", sa.Integer(), sa.ForeignKey("storage_plans.id")),
        sa.Column("storage_start_date", sa.Date()),
        sa.Column("storage_end_date", sa.Date()),
        sa.Column("quoted_amount_aed", sa.Numeric(12, 2)),
        sa.Column("notes", sa.Text()),
        sa.Column("admin_notes", sa.Text()),
        sa.Column("source", sa.String(24), server_default="web"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_bookings_ref", "bookings", ["ref"], unique=True)

    op.create_table(
        "inquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("phone", sa.String(32), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("subject", sa.String(200)),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(24), server_default="new"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "about",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("subtitle", sa.String(255)),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("mission", sa.Text()),
        sa.Column("vision", sa.Text()),
        sa.Column("values", _json()),
        sa.Column("images", _json()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "faqs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question", sa.String(400), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_name", sa.String(160), nullable=False),
        sa.Column("quote", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), server_default="5"),
        sa.Column("vehicle_note", sa.String(160)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("alt", sa.String(255)),
        sa.Column("filename", sa.String(255)),
        sa.Column("content_type", sa.String(120)),
        sa.Column("byte_size", sa.Integer()),
        sa.Column("folder", sa.String(80)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "page_copy",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(120), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_page_copy_key", "page_copy", ["key"], unique=True)


def downgrade() -> None:
    for table in [
        "page_copy",
        "media",
        "testimonials",
        "faqs",
        "about",
        "inquiries",
        "bookings",
        "storage_plans",
        "vehicle_types",
        "routes",
        "locations",
        "services",
        "hero_banners",
        "site_settings",
        "users",
    ]:
        op.drop_table(table)
