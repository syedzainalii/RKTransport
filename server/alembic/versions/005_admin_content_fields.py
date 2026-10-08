"""Add fields used by the friendly admin content forms.

Revision ID: 005
Revises: 004
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "005"
down_revision: Union[str, Sequence[str], None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("locations", sa.Column("pickup_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("locations", sa.Column("dropoff_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("services", sa.Column("starting_price_note", sa.String(length=120), nullable=True))
    op.add_column("testimonials", sa.Column("image_url", sa.Text(), nullable=True))
    op.add_column("testimonials", sa.Column("image_alt", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("testimonials", "image_alt")
    op.drop_column("testimonials", "image_url")
    op.drop_column("services", "starting_price_note")
    op.drop_column("locations", "dropoff_enabled")
    op.drop_column("locations", "pickup_enabled")
