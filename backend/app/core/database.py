"""Engine, creación de tablas y fábrica de sesiones."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_url = settings.DATABASE_URL
# El stack usa psycopg2: SQLAlchemy 2.1 asume psycopg 3 con "postgresql://", así que se fija el driver.
if _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+psycopg2://", 1)

_connect_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}
engine = create_engine(_url, pool_pre_ping=True, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas que faltan. Importar los modelos los registra en la metadata."""
    from app.db import models_registry  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Una sesión nueva; la abre y la cierra el Unit of Work.

    expire_on_commit=False: tras el commit del __exit__ los objetos leídos (p. ej. el usuario
    de la sesión) siguen usables fuera del bloque, sin volver a consultar la base.
    """
    return Session(engine, expire_on_commit=False)
