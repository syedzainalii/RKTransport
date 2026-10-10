"""Add public fleet vehicles."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "009"
down_revision: Union[str, Sequence[str], None] = "e2e6249ad219"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    chips_type = sa.JSON().with_variant(
        postgresql.JSONB(astext_type=sa.Text()), "postgresql"
    )
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("seats", sa.String(length=120), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("chips", chips_type, nullable=False, server_default="[]"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_vehicles_id", "vehicles", ["id"], unique=False)
    op.create_index("ix_vehicles_slug", "vehicles", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_vehicles_slug", table_name="vehicles")
    op.drop_index("ix_vehicles_id", table_name="vehicles")
    op.drop_table("vehicles")
