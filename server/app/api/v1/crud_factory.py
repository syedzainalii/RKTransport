from typing import Any, Type

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.database import get_db
from app.models.user import User
from app.services.revalidate_frontend import schedule_public_revalidation
from app.utils.slug import unique_slug


def crud_router(
    *,
    model: Type,
    schema_in: Type[BaseModel],
    schema_out: Type[BaseModel],
    prefix: str,
    tag: str,
    slug_from: str | None = None,
    public_active_only: bool = True,
    order_by: Any = None,
) -> APIRouter:
    router = APIRouter(tags=[tag])
    order = order_by if order_by is not None else getattr(model, "id")

    @router.get(prefix, response_model=list[schema_out])
    async def list_public(db: Session = Depends(get_db)):
        q = db.query(model)
        if public_active_only and hasattr(model, "is_active"):
            q = q.filter(model.is_active.is_(True))
        return q.order_by(order).all()

    @router.get(f"{prefix}/{{item_id}}", response_model=schema_out)
    async def get_one(item_id: int, db: Session = Depends(get_db)):
        q = db.query(model).filter(model.id == item_id)
        if public_active_only and hasattr(model, "is_active"):
            q = q.filter(model.is_active.is_(True))
        row = q.first()
        if not row:
            raise HTTPException(404, "Not found")
        return row

    if hasattr(model, "slug"):

        @router.get(f"{prefix}/slug/{{slug}}", response_model=schema_out)
        async def get_by_slug(slug: str, db: Session = Depends(get_db)):
            q = db.query(model).filter(model.slug == slug)
            if public_active_only and hasattr(model, "is_active"):
                q = q.filter(model.is_active.is_(True))
            row = q.first()
            if not row:
                raise HTTPException(404, "Not found")
            return row

    @router.get(f"/admin{prefix}", response_model=list[schema_out])
    async def list_admin(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
        return db.query(model).order_by(order).all()

    @router.post(f"/admin{prefix}", response_model=schema_out)
    async def create_item(
        payload: schema_in,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        _: User = Depends(get_current_admin_user),
    ):
        data = payload.model_dump()
        if slug_from:
            data["slug"] = unique_slug(db, model, data.get(slug_from) or "item")
        row = model(**data)
        db.add(row)
        db.commit()
        db.refresh(row)
        schedule_public_revalidation(background_tasks)
        return row

    @router.put(f"/admin{prefix}/{{item_id}}", response_model=schema_out)
    async def update_item(
        item_id: int,
        payload: schema_in,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        _: User = Depends(get_current_admin_user),
    ):
        row = db.query(model).filter(model.id == item_id).first()
        if not row:
            raise HTTPException(404, "Not found")
        data = payload.model_dump()
        if slug_from:
            data["slug"] = unique_slug(db, model, data.get(slug_from) or "item", exclude_id=item_id)
        for key, value in data.items():
            setattr(row, key, value)
        db.commit()
        db.refresh(row)
        schedule_public_revalidation(background_tasks)
        return row

    @router.delete(f"/admin{prefix}/{{item_id}}")
    async def delete_item(
        item_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        _: User = Depends(get_current_admin_user),
    ):
        row = db.query(model).filter(model.id == item_id).first()
        if not row:
            raise HTTPException(404, "Not found")
        db.delete(row)
        db.commit()
        schedule_public_revalidation(background_tasks)
        return {"detail": "Deleted"}

    return router
