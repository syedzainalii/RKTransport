from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin_user
from app.core.database import get_db
from app.models.car_make import CarMake
from app.models.car_model import CarModel
from app.models.user import User
from app.models.vehicle_type import VehicleType
from app.schemas.car_catalog import (
    BulkCarModelsInput,
    CarMakeInput,
    CarMakeResponse,
    CarModelInput,
    CarModelResponse,
)
from app.services.revalidate_frontend import schedule_public_revalidation

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


@router.get("/admin/car-makes", response_model=list[CarMakeResponse])
async def list_admin_makes(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    return (
        db.query(CarMake)
        .options(selectinload(CarMake.models))
        .order_by(CarMake.sort_order, CarMake.name)
        .all()
    )


@router.post("/admin/car-makes", response_model=CarMakeResponse)
async def create_make(
    payload: CarMakeInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    if db.query(CarMake).filter(CarMake.name.ilike(payload.name)).first():
        raise HTTPException(409, "A make with this name already exists")
    row = CarMake(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@router.put("/admin/car-makes/{make_id}", response_model=CarMakeResponse)
async def update_make(
    make_id: int,
    payload: CarMakeInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(CarMake).filter(CarMake.id == make_id).first()
    if not row:
        raise HTTPException(404, "Make not found")
    duplicate = db.query(CarMake).filter(CarMake.name.ilike(payload.name), CarMake.id != make_id).first()
    if duplicate:
        raise HTTPException(409, "A make with this name already exists")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@router.delete("/admin/car-makes/{make_id}")
async def delete_make(
    make_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(CarMake).filter(CarMake.id == make_id).first()
    if not row:
        raise HTTPException(404, "Make not found")
    db.delete(row)
    db.commit()
    schedule_public_revalidation(background_tasks)
    return {"detail": "Deleted"}


@router.post("/admin/car-makes/{make_id}/models", response_model=CarModelResponse)
async def create_model(
    make_id: int,
    payload: CarModelInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    make = db.query(CarMake).filter(CarMake.id == make_id).first()
    if not make:
        raise HTTPException(404, "Make not found")
    if db.query(CarModel).filter(CarModel.make_id == make_id, CarModel.name.ilike(payload.name)).first():
        raise HTTPException(409, "This model already exists for the selected make")
    if payload.default_vehicle_type_id and not db.query(VehicleType).filter(
        VehicleType.id == payload.default_vehicle_type_id,
        VehicleType.is_active.is_(True),
    ).first():
        raise HTTPException(422, "Choose a valid vehicle type")
    row = CarModel(make_id=make_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@router.post("/admin/car-makes/{make_id}/models/bulk", response_model=list[CarModelResponse])
async def bulk_create_models(
    make_id: int,
    payload: BulkCarModelsInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    if not db.query(CarMake).filter(CarMake.id == make_id).first():
        raise HTTPException(404, "Make not found")
    existing = {
        model.name.casefold()
        for model in db.query(CarModel).filter(CarModel.make_id == make_id).all()
    }
    rows = [
        CarModel(make_id=make_id, name=name, is_active=True)
        for name in payload.models
        if name.casefold() not in existing
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    if rows:
        schedule_public_revalidation(background_tasks)
    return rows


@router.put("/admin/car-models/{model_id}", response_model=CarModelResponse)
async def update_model(
    model_id: int,
    payload: CarModelInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(CarModel).filter(CarModel.id == model_id).first()
    if not row:
        raise HTTPException(404, "Model not found")
    duplicate = (
        db.query(CarModel)
        .filter(CarModel.make_id == row.make_id, CarModel.name.ilike(payload.name), CarModel.id != model_id)
        .first()
    )
    if duplicate:
        raise HTTPException(409, "This model already exists for the selected make")
    if payload.default_vehicle_type_id and not db.query(VehicleType).filter(
        VehicleType.id == payload.default_vehicle_type_id,
        VehicleType.is_active.is_(True),
    ).first():
        raise HTTPException(422, "Choose a valid vehicle type")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    schedule_public_revalidation(background_tasks)
    return row


@router.delete("/admin/car-models/{model_id}")
async def delete_model(
    model_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    row = db.query(CarModel).filter(CarModel.id == model_id).first()
    if not row:
        raise HTTPException(404, "Model not found")
    db.delete(row)
    db.commit()
    schedule_public_revalidation(background_tasks)
    return {"detail": "Deleted"}
