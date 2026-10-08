"""booking availability and expanded about/service content

Revision ID: 003
Revises: 002
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, Sequence[str], None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _json():
    return sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql")


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("booking_time_slots", _json(), nullable=False, server_default="[]"))
    op.add_column("site_settings", sa.Column("blocked_dates", _json(), nullable=False, server_default="[]"))
    op.add_column("services", sa.Column("gallery", _json(), nullable=False, server_default="[]"))
    op.add_column("about", sa.Column("stats", _json(), nullable=False, server_default="[]"))
    op.add_column("about", sa.Column("story_image_side", sa.String(8), nullable=False, server_default="left"))
    op.add_column("about", sa.Column("why_choose_us", _json(), nullable=False, server_default="[]"))


def downgrade() -> None:
    op.drop_column("about", "why_choose_us")
    op.drop_column("about", "story_image_side")
    op.drop_column("about", "stats")
    op.drop_column("services", "gallery")
    op.drop_column("site_settings", "blocked_dates")
    op.drop_column("site_settings", "booking_time_slots")
