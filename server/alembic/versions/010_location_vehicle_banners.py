"""Add page banners to fleet vehicles and locations."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "010"
down_revision: Union[str, Sequence[str], None] = "009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("vehicles", sa.Column("banner_image_url", sa.Text(), nullable=True))
    op.add_column("locations", sa.Column("banner_image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("locations", "banner_image_url")
    op.drop_column("vehicles", "banner_image_url")
