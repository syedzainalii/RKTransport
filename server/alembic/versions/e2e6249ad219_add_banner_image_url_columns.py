"""add banner_image_url columns

Revision ID: e2e6249ad219
Revises: 008
Create Date: 2026-10-09 18:39:30.935729

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e2e6249ad219"
down_revision: Union[str, Sequence[str], None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tables that need a banner_image_url column.
TABLES = ["about", "services", "testimonials"]
COLUMN = "banner_image_url"


def _columns(table: str) -> set[str]:
    inspector = sa.inspect(op.get_bind())
    if table not in inspector.get_table_names():
        return set()
    return {col["name"] for col in inspector.get_columns(table)}


def upgrade() -> None:
    for table in TABLES:
        existing = _columns(table)
        # Skip if the table is missing or the column was already added.
        if existing and COLUMN not in existing:
            op.add_column(table, sa.Column(COLUMN, sa.Text(), nullable=True))


def downgrade() -> None:
    for table in TABLES:
        if COLUMN in _columns(table):
            op.drop_column(table, COLUMN) 