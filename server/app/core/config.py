from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "RK Transport API"
    DEBUG: bool = False
    TIMEZONE: str = "Asia/Dubai"
    CURRENCY_CODE: str = "AED"

    SECRET_KEY: str = "change-me-min-32-chars-long-secret-key!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8

    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/rk_transport"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "change-this-password"
    ADMIN_EMAIL: str = "admin@rktransport.ae"

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"  # lax | strict | none
    COOKIE_DOMAIN: str | None = None

    # Image uploads are stored in Cloudinary.
    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    FRONTEND_URL: str = "http://localhost:3000"
    REVALIDATE_SECRET: str = "change-me-revalidate-secret"
    MAX_FILE_SIZE: int = 4_000_000

    RATE_LIMIT_LOGIN: int = 10
    RATE_LIMIT_PUBLIC_POST: int = 20

    WHATSAPP_PROVIDER: str = "cloud_api"
    WHATSAPP_CLOUD_PHONE_NUMBER_ID: str | None = None
    WHATSAPP_CLOUD_ACCESS_TOKEN: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_WHATSAPP_FROM: str | None = None

    EMAIL_PROVIDER: str = "smtp"
    EMAIL_FROM: str | None = None
    RESEND_API_KEY: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_STARTTLS: bool = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        if os.getenv("VERCEL"):
            missing = []
            if (
                len(self.SECRET_KEY) < 32
                or self.SECRET_KEY == "change-me-min-32-chars-long-secret-key!!"
                or "replace-with" in self.SECRET_KEY.lower()
            ):
                missing.append("SECRET_KEY")
            if len(self.ADMIN_PASSWORD) < 12 or "replace-with" in self.ADMIN_PASSWORD.lower():
                missing.append("ADMIN_PASSWORD")
            if "USER:PASSWORD@HOST" in self.DATABASE_URL or self.DATABASE_URL.endswith("/rk_transport"):
                missing.append("DATABASE_URL")
            if not self.ALLOWED_ORIGINS or "*" in self.ALLOWED_ORIGINS or "localhost" in self.ALLOWED_ORIGINS:
                missing.append("ALLOWED_ORIGINS")
            if len(self.REVALIDATE_SECRET) < 32 or "replace-with" in self.REVALIDATE_SECRET.lower():
                missing.append("REVALIDATE_SECRET")
            if self.FRONTEND_URL.startswith("http://localhost"):
                missing.append("FRONTEND_URL")
            if not all((self.CLOUDINARY_CLOUD_NAME, self.CLOUDINARY_API_KEY, self.CLOUDINARY_API_SECRET)):
                missing.append("Cloudinary credentials")
            if self.DEBUG:
                missing.append("DEBUG=false")
            if missing:
                raise ValueError(f"Set production environment variables: {', '.join(missing)}")

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def cookie_samesite(self) -> str:
        value = (self.COOKIE_SAMESITE or "lax").lower()
        if value not in {"lax", "strict", "none"}:
            return "lax"
        return value


settings = Settings()
os.environ.setdefault("TZ", settings.TIMEZONE)
