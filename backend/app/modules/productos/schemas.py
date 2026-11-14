from typing import Optional

from pydantic import model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    categoria_id: int = Field(ge=1)
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    categoria_id: Optional[int] = Field(default=None, ge=1)
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoStockUpdate(SQLModel):
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None

    @model_validator(mode="after")
    def _al_menos_uno(self) -> "ProductoStockUpdate":
        if self.stock is None and self.disponible is None:
            raise ValueError("Enviar al menos stock o disponible")
        return self


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
