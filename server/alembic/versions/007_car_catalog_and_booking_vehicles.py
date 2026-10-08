"""Add car catalog and selected vehicles to bookings."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007"
down_revision: Union[str, Sequence[str], None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "car_makes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_car_makes_name", "car_makes", ["name"], unique=False)
    op.create_table(
        "car_models",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("make_id", sa.Integer(), sa.ForeignKey("car_makes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("default_vehicle_type_id", sa.Integer(), sa.ForeignKey("vehicle_types.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_car_models_make_id", "car_models", ["make_id"], unique=False)
    op.add_column("bookings", sa.Column("vehicles", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "vehicles")
    op.drop_index("ix_car_models_make_id", table_name="car_models")
    op.drop_table("car_models")
    op.drop_index("ix_car_makes_name", table_name="car_makes")
    op.drop_table("car_makes")
