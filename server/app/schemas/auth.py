from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class UserLogin(BaseModel):
    username: str
    password: str


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=12, max_length=256)


class UserResponse(ORMModel):
    id: int
    username: str
    email: str | None
    is_admin: bool
    is_active: bool
