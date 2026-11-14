from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario

from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])

NOT_FOUND = {404: {"description": "El producto (o la categoría indicada) no existe o está dado de baja"}}


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(session_factory))


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
ProductoId = Annotated[int, Path(ge=1, description="Id del producto")]


def _no_encontrado(e: Exception) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.get(
    "",
    response_model=ProductosPaginados,
    summary="Listar productos activos (paginado, con búsqueda y filtros)",
)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0, description="Registros a saltear")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Máximo de registros")] = 20,
    search: Annotated[
        Optional[str], Query(description="Coincidencia parcial en el nombre, sin distinguir mayúsculas")
    ] = None,
    categoria_id: Annotated[Optional[int], Query(ge=1)] = None,
    disponible: Annotated[Optional[bool], Query()] = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead, summary="Detalle con su categoría", responses=NOT_FOUND)
def obtener_producto(producto_id: ProductoId, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un producto (admin)",
    responses=NOT_FOUND,
)
def crear_producto(data: ProductoCreate, _: AdminDep, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise _no_encontrado(e)


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    summary="Actualizar los campos enviados (admin)",
    responses=NOT_FOUND,
)
def actualizar_producto(
    producto_id: ProductoId, data: ProductoUpdate, _: AdminDep, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise _no_encontrado(e)


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    summary="Actualizar stock y disponibilidad (admin)",
    responses=NOT_FOUND,
)
def actualizar_stock(
    producto_id: ProductoId, data: ProductoStockUpdate, _: AdminDep, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica del producto (admin)",
    responses=NOT_FOUND,
)
def eliminar_producto(producto_id: ProductoId, _: AdminDep, service: ServiceDep) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)
