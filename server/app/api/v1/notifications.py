from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.database import get_db
from app.models.notification_log import NotificationLog
from app.models.user import User
from app.schemas.notification import NotificationLogResponse
from app.services.notifications import retry_notification

router = APIRouter(tags=["Notifications"])


@router.get("/admin/notifications", response_model=list[NotificationLogResponse])
async def list_notifications(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    return db.query(NotificationLog).order_by(NotificationLog.created_at.desc()).limit(250).all()


@router.post("/admin/notifications/{log_id}/retry", response_model=NotificationLogResponse)
async def retry_failed_notification(
    log_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    log = db.query(NotificationLog).filter(NotificationLog.id == log_id).first()
    if not log:
        raise HTTPException(404, "Notification not found")
    if log.status != "failed":
        raise HTTPException(409, "Only failed notifications can be retried")
    log.status = "pending"
    log.last_error = None
    db.commit()
    db.refresh(log)
    background_tasks.add_task(retry_notification, log.id)
    return log
