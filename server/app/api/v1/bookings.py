from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from app.api.deps import get_current_admin_user
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.models.booking import Booking
from app.models.location import Location
from app.models.settings import SiteSettings
from app.models.user import User
from app.schemas.booking import (
    BookingAdminUpdate,
    BookingCreate,
    BookingResponse,
    PublicBookingResponse,
)
from app.services.notifications import notify_event
from app.utils.refs import booking_ref

router = APIRouter(tags=["Bookings"])


@router.get("/admin/bookings/by-route")
async def bookings_by_route(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    pickup = aliased(Location)
    dropoff = aliased(Location)
    origin = func.coalesce(Booking.pickup_address, pickup.name, "Pickup not provided")
    destination = func.coalesce(Booking.dropoff_address, dropoff.name, "Drop-off not provided")
    rows = (
        db.query(origin, destination, func.count(Booking.id))
        .outerjoin(pickup, Booking.pickup_location_id == pickup.id)
        .outerjoin(dropoff, Booking.dropoff_location_id == dropoff.id)
        .group_by(origin, destination)
        .all()
    )
    return [
        {"label": f"{origin_name} → {destination_name}", "total": total}
        for origin_name, destination_name, total in rows
    ]


@router.post("/bookings", response_model=BookingResponse)
async def create_booking(
    payload: BookingCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, settings.RATE_LIMIT_PUBLIC_POST)
    availability = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    dubai = ZoneInfo("Asia/Dubai")
    if payload.scheduled_at:
        scheduled_at = payload.scheduled_at
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=dubai)
        local_time = scheduled_at.astimezone(dubai)
        if local_time < datetime.now(timezone.utc).astimezone(dubai):
            raise HTTPException(422, "Choose a date and time in the future")
        if availability and local_time.date().isoformat() in (availability.blocked_dates or []):
            raise HTTPException(422, "The selected date is unavailable")
        if availability and availability.booking_time_slots and local_time.strftime("%H:%M") not in availability.booking_time_slots:
            raise HTTPException(422, "The selected time is unavailable")
    if payload.type == "storage" and payload.storage_start_date:
        today_in_dubai = datetime.now(dubai).date()
        if payload.storage_start_date < today_in_dubai:
            raise HTTPException(422, "Choose a storage start date that is not in the past")
        if availability and payload.storage_start_date.isoformat() in (availability.blocked_dates or []):
            raise HTTPException(422, "The selected storage start date is unavailable")
    row = Booking(ref=booking_ref(), status="new", admin_notes=None, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    background_tasks.add_task(notify_event, "booking_created", "booking", row.id)
    return row


@router.get("/bookings/track/{ref}", response_model=PublicBookingResponse)
async def track_booking(ref: str, db: Session = Depends(get_db)):
    row = db.query(Booking).filter(Booking.ref == ref.upper()).first()
    if not row:
        raise HTTPException(404, "Booking not found")
    return row


@router.get("/admin/bookings", response_model=list[BookingResponse])
async def list_bookings(
    type: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    q = db.query(Booking)
    if type:
        q = q.filter(Booking.type == type)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.created_at.desc()).all()


@router.get("/admin/bookings/{item_id}", response_model=BookingResponse)
async def get_booking(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(Booking).filter(Booking.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    return row


@router.put("/admin/bookings/{item_id}", response_model=BookingResponse)
async def update_booking(
    item_id: int,
    payload: BookingAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(Booking).filter(Booking.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/admin/bookings/{item_id}")
async def delete_booking(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(Booking).filter(Booking.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()
    return {"detail": "Deleted"}
