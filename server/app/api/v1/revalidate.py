from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin_user
from app.models.user import User
from app.services.revalidate_frontend import revalidate_paths

router = APIRouter(tags=["Revalidate"])


class RevalidateIn(BaseModel):
    paths: list[str] | None = None


@router.post("/admin/revalidate")
async def revalidate(payload: RevalidateIn, _: User = Depends(get_current_admin_user)):
    return await revalidate_paths(payload.paths)
