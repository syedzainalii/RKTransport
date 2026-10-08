from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.car_make import CarMake
from app.schemas.car_catalog import CarMakeResponse

router = APIRouter(tags=["Car Catalog"])


@router.get("/car-makes", response_model=list[CarMakeResponse])
async def list_public_makes(db: Session = Depends(get_db)):
    makes = (
        db.query(CarMake)
        .options(selectinload(CarMake.models))
        .filter(CarMake.is_active.is_(True))
        .order_by(CarMake.sort_order, CarMake.name)
        .all()
    )
    return [
        {
            "id": make.id,
            "name": make.name,
            "is_active": make.is_active,
            "sort_order": make.sort_order,
            "models": sorted(
                (model for model in make.models if model.is_active),
                key=lambda model: model.name.casefold(),
            ),
        }
        for make in makes
    ]

