"""notification delivery logs and channel settings

Revision ID: 002
Revises: 001
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, Sequence[str], None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "site_settings",
        sa.Column("notifications_email_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "site_settings",
        sa.Column("notifications_whatsapp_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("site_settings", sa.Column("notification_admin_email", sa.String(255)))
    op.add_column("site_settings", sa.Column("notification_admin_phone", sa.String(32)))
    json_type = sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql")
    op.create_table(
        "notification_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(32), nullable=False),
        sa.Column("entity_type", sa.String(24), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.String(16), nullable=False),
        sa.Column("recipient", sa.String(255), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("payload", json_type, nullable=False),
        sa.Column("last_error", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    for column in ("event_type", "entity_type", "entity_id", "channel", "status"):
        op.create_index(f"ix_notification_logs_{column}", "notification_logs", [column])


def downgrade() -> None:
    for column in ("event_type", "entity_type", "entity_id", "channel", "status"):
        op.drop_index(f"ix_notification_logs_{column}", table_name="notification_logs")
    op.drop_table("notification_logs")
    op.drop_column("site_settings", "notification_admin_phone")
    op.drop_column("site_settings", "notification_admin_email")
    op.drop_column("site_settings", "notifications_whatsapp_enabled")
    op.drop_column("site_settings", "notifications_email_enabled")
