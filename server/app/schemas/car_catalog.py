from pydantic import Field, field_validator

from app.schemas.common import ORMModel


class CarModelInput(ORMModel):
    name: str = Field(min_length=1, max_length=100)
    default_vehicle_type_id: int | None = Field(default=None, gt=0)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Enter a name")
        return cleaned


class CarModelResponse(ORMModel):
    id: int
    make_id: int
    name: str
    default_vehicle_type_id: int | None
    is_active: bool


class CarMakeInput(ORMModel):
    name: str = Field(min_length=1, max_length=100)
    is_active: bool = True
    sort_order: int = 0

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Enter a name")
        return cleaned


class CarMakeResponse(ORMModel):
    id: int
    name: str
    is_active: bool
    sort_order: int
    models: list[CarModelResponse] = Field(default_factory=list)


class BulkCarModelsInput(ORMModel):
    models: list[str] = Field(min_length=1, max_length=200)

    @field_validator("models")
    @classmethod
    def clean_models(cls, values: list[str]) -> list[str]:
        cleaned = list(dict.fromkeys(value.strip() for value in values if value.strip()))
        if not cleaned:
            raise ValueError("Add at least one model name")
        return cleaned
