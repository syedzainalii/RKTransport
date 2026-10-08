"""Store alternative text for uploaded business logos."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "006"
down_revision: Union[str, Sequence[str], None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("logo_alt", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("logo_dark_alt", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "logo_dark_alt")
    op.drop_column("site_settings", "logo_alt")
