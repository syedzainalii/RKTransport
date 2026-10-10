"""merge multiple heads

Revision ID: 03d935f33986
Revises: 010, db82ae79c13a
Create Date: 2026-10-11 04:11:55.863862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '03d935f33986'
down_revision: Union[str, Sequence[str], None] = ('010', 'db82ae79c13a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
