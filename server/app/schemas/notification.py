from datetime import datetime

from app.schemas.common import ORMModel


class NotificationLogResponse(ORMModel):
    id: int
    event_type: str
    entity_type: str
    entity_id: int
    channel: str
    recipient: str
    status: str
    attempts: int
    last_error: str | None
    created_at: datetime
    updated_at: datetime
