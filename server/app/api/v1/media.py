from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.models.media import Media
from app.models.user import User
from app.schemas.content import MediaResponse
from app.services.image_storage import upload_image

router = APIRouter(tags=["Media"])


@router.get("/admin/media", response_model=list[MediaResponse])
async def list_media(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    return db.query(Media).order_by(Media.created_at.desc()).all()


@router.post("/admin/media", response_model=dict[str, str])
async def upload_media(
    file: UploadFile = File(...),
    alt: str | None = Form(None),
    folder: str = Form("general"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    url, size, content_type = await upload_image(file, folder)
    row = Media(
        url=url,
        alt=alt,
        filename=file.filename,
        content_type=content_type,
        byte_size=size,
        folder=folder,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"url": row.url}


@router.post("/media/booking-photos", response_model=dict[str, str])
async def upload_booking_photo(request: Request, file: UploadFile = File(...)):
    check_rate_limit(request, settings.RATE_LIMIT_PUBLIC_POST)
    url, _, _ = await upload_image(file, "booking-photos")
    return {"url": url}


@router.delete("/admin/media/{item_id}")
async def delete_media(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    from fastapi import HTTPException

    row = db.query(Media).filter(Media.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()
    return {"detail": "Deleted"}
