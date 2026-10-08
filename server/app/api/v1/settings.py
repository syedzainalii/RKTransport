from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.database import get_db
from app.models.settings import SiteSettings
from app.models.user import User
from app.schemas.settings import AdminSiteSettingsResponse, SiteSettingsResponse, SiteSettingsUpdate
from app.services.revalidate_frontend import schedule_public_revalidation

router = APIRouter(tags=["Settings"])


def _get_or_404(db: Session) -> SiteSettings:
    row = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not row:
        row = SiteSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/settings", response_model=SiteSettingsResponse)
async def get_settings(db: Session = Depends(get_db)):
    return _get_or_404(db)


@router.get("/admin/settings", response_model=AdminSiteSettingsResponse)
async def get_admin_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    return _get_or_404(db)


@router.put("/admin/settings", response_model=AdminSiteSettingsResponse)
async def update_settings(
    payload: SiteSettingsUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = _get_or_404(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row
