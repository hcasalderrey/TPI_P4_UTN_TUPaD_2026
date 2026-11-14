from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada

from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork

__all__ = ["CategoriaNoEncontrada", "ProductoNoEncontrado", "ProductoService"]


class ProductoNoEncontrado(Exception):
    def __init__(self, id: int) -> None:
        super().__init__(f"El producto {id} no existe")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        cambios = data.model_dump(exclude_unset=True, exclude_none=True)
        with self.uow as uow:
            producto = self._activo(uow, id)
            if "categoria_id" in cambios:
                self._categoria_activa(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, id)
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.session.flush()
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        """Baja lógica: activo = false."""
        with self.uow as uow:
            self._activo(uow, id).activo = False

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, id: int) -> Producto:
        producto = uow.productos.get_by_id(id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(id)
        return producto

    @staticmethod
    def _categoria_activa(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
