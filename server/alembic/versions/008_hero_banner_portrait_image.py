"""Add portrait hero banner images."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "008"
down_revision: Union[str, Sequence[str], None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("hero_banners", sa.Column("portrait_image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("hero_banners", "portrait_image_url")
