from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def require_uae_phone(value: str) -> str:
    cleaned = (value or "").strip().replace(" ", "")
    if not cleaned.startswith("+971") or len(cleaned) < 12:
        raise ValueError("Phone must be in +971 format")
    if not cleaned[1:].isdigit():
        raise ValueError("Phone must be in +971 format")
    return cleaned


class PhoneMixin(BaseModel):
    @field_validator("phone", "customer_phone", "phone_primary", "phone_recovery", "whatsapp", mode="before", check_fields=False)
    @classmethod
    def _phone(cls, v: Any) -> Any:
        if v in (None, ""):
            return v
        return require_uae_phone(str(v))


class Message(BaseModel):
    detail: str
