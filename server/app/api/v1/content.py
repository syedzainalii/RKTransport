from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin_user
from app.api.v1.crud_factory import crud_router
from app.core.database import get_db
from app.models.about import About
from app.models.faq import Faq
from app.models.hero_banner import HeroBanner
from app.models.location import Location
from app.models.page_copy import PageCopy
from app.models.route import Route
from app.models.service import Service
from app.models.storage_plan import StoragePlan
from app.models.testimonial import Testimonial
from app.models.user import User
from app.models.vehicle_type import VehicleType
from app.schemas.content import (
    AboutIn,
    AboutResponse,
    FaqIn,
    FaqResponse,
    HeroBannerIn,
    HeroBannerResponse,
    LocationIn,
    LocationResponse,
    PageCopyIn,
    PageCopyResponse,
    RouteResponse,
    ServiceIn,
    ServiceResponse,
    StoragePlanIn,
    StoragePlanResponse,
    TestimonialIn,
    TestimonialResponse,
    VehicleTypeIn,
    VehicleTypeResponse,
)
from app.services.revalidate_frontend import schedule_public_revalidation

hero_router = crud_router(
    model=HeroBanner,
    schema_in=HeroBannerIn,
    schema_out=HeroBannerResponse,
    prefix="/hero-banners",
    tag="Hero Banners",
    order_by=HeroBanner.sort_order,
)

services_router = crud_router(
    model=Service,
    schema_in=ServiceIn,
    schema_out=ServiceResponse,
    prefix="/services",
    tag="Services",
    slug_from="title",
    order_by=Service.sort_order,
)

locations_router = crud_router(
    model=Location,
    schema_in=LocationIn,
    schema_out=LocationResponse,
    prefix="/locations",
    tag="Locations",
    slug_from="name",
    order_by=Location.sort_order,
    admin_enabled=False,
)

vehicle_router = crud_router(
    model=VehicleType,
    schema_in=VehicleTypeIn,
    schema_out=VehicleTypeResponse,
    prefix="/vehicle-types",
    tag="Vehicle Types",
    slug_from="name",
    order_by=VehicleType.sort_order,
    admin_enabled=False,
)

storage_router = crud_router(
    model=StoragePlan,
    schema_in=StoragePlanIn,
    schema_out=StoragePlanResponse,
    prefix="/storage-plans",
    tag="Storage Plans",
    slug_from="title",
    order_by=StoragePlan.sort_order,
    admin_enabled=False,
)

faq_router = crud_router(
    model=Faq,
    schema_in=FaqIn,
    schema_out=FaqResponse,
    prefix="/faqs",
    tag="FAQs",
    order_by=Faq.sort_order,
)

testimonial_router = crud_router(
    model=Testimonial,
    schema_in=TestimonialIn,
    schema_out=TestimonialResponse,
    prefix="/testimonials",
    tag="Testimonials",
    order_by=Testimonial.sort_order,
)

page_copy_router = crud_router(
    model=PageCopy,
    schema_in=PageCopyIn,
    schema_out=PageCopyResponse,
    prefix="/page-copy",
    tag="Page Copy",
    public_active_only=False,
    order_by=PageCopy.key,
)

# Routes need joined origin/destination
routes_router = APIRouter(tags=["Routes"])


@routes_router.get("/routes", response_model=list[RouteResponse])
async def list_routes(db: Session = Depends(get_db)):
    q = (
        db.query(Route)
        .options(joinedload(Route.origin), joinedload(Route.destination))
        .filter(Route.is_active.is_(True))
        .order_by(Route.sort_order)
    )
    return q.all()


# About is a singleton-style list
about_router = APIRouter(tags=["About"])


@about_router.get("/about", response_model=list[AboutResponse])
async def get_about(db: Session = Depends(get_db)):
    return db.query(About).all()


@about_router.get("/admin/about", response_model=list[AboutResponse])
async def get_about_admin(
    db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)
):
    return db.query(About).order_by(About.id).all()


@about_router.post("/admin/about", response_model=AboutResponse)
async def create_about(
    payload: AboutIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)
):
    row = About(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@about_router.put("/admin/about/{item_id}", response_model=AboutResponse)
async def update_about(
    item_id: int,
    payload: AboutIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(About).filter(About.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@about_router.delete("/admin/about/{item_id}")
async def delete_about(
    item_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)
):
    row = db.query(About).filter(About.id == item_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()
    schedule_public_revalidation(background_tasks)
    return {"detail": "Deleted"}
