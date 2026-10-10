from fastapi import APIRouter

from app.api.v1 import auth, car_catalog, inquiries, media, notifications, revalidate, settings
from app.api.v1.content import (
    about_router,
    cars_router,
    faq_router,
    hero_router,
    locations_router,
    page_banner_router,
    page_copy_router,
    routes_router,
    services_router,
    storage_router,
    testimonial_router,
    vehicle_router,
)

api_v1 = APIRouter()
api_v1.include_router(auth.router)
api_v1.include_router(settings.router)
api_v1.include_router(hero_router)
api_v1.include_router(services_router)
api_v1.include_router(locations_router)
api_v1.include_router(routes_router)
api_v1.include_router(vehicle_router)
api_v1.include_router(cars_router)
api_v1.include_router(storage_router)
api_v1.include_router(faq_router)
api_v1.include_router(testimonial_router)
api_v1.include_router(page_copy_router)
api_v1.include_router(page_banner_router)
api_v1.include_router(about_router)
api_v1.include_router(car_catalog.router)
api_v1.include_router(inquiries.router)
api_v1.include_router(media.router)
api_v1.include_router(notifications.router)
api_v1.include_router(revalidate.router)