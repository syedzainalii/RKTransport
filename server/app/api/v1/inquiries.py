from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.models.inquiry import Inquiry
from app.models.user import User
from app.schemas.booking import InquiryCreate, InquiryResponse, InquiryStatusUpdate
from app.services.notifications import notify_event

router = APIRouter(tags=["Inquiries"])


@router.post("/inquiries", response_model=InquiryResponse)
async def create_inquiry(
    payload: InquiryCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, settings.RATE_LIMIT_PUBLIC_POST)
    row = Inquiry(**payload.model_dump(), status="new")
    db.add(row)
    db.commit()
    db.refresh(row)
    background_tasks.add_task(notify_event, "inquiry_created", "inquiry", row.id)
    return row


@router.get("/admin/inquiries", response_model=list[InquiryResponse])
async def list_inquiries(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    return db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()


@router.patch("/admin/inquiries/{item_id}", response_model=InquiryResponse)
async def update_inquiry(
    item_id: int,
    payload: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(Inquiry).filter(Inquiry.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    row.status = payload.status
    db.commit()
    db.refresh(row)
    return row
