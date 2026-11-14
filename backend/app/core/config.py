"""Configuración de la aplicación: variables leídas de backend/.env (pydantic-settings)."""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env, sin importar desde qué carpeta se ejecute la aplicación.
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    # En producción (HTTPS) la cookie debe viajar solo por conexiones seguras.
    COOKIE_SECURE: bool = False


settings = Settings()  # type: ignore[call-arg]
