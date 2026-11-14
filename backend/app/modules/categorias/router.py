from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])

NOT_FOUND = {404: {"description": "La categoría no existe o está dada de baja"}}
CONFLICT = {409: {"description": "Ya existe una categoría con ese nombre"}}


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(session_factory))


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
CategoriaId = Annotated[int, Path(ge=1, description="Id de la categoría")]


def _http(e: Exception) -> HTTPException:
    if isinstance(e, CategoriaNoEncontrada):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return HTTPException(status.HTTP_409_CONFLICT, str(e))  # NombreDuplicado


@router.get("", response_model=list[CategoriaRead], summary="Listar las categorías activas")
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead, summary="Detalle", responses=NOT_FOUND)
def obtener_categoria(categoria_id: CategoriaId, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _http(e)


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una categoría (admin)",
    responses=CONFLICT,
)
def crear_categoria(data: CategoriaCreate, _: AdminDep, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise _http(e)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    summary="Actualizar los campos enviados (admin)",
    responses={**NOT_FOUND, **CONFLICT},
)
def actualizar_categoria(
    categoria_id: CategoriaId, data: CategoriaUpdate, _: AdminDep, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as e:
        raise _http(e)


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de la categoría (admin)",
    responses=NOT_FOUND,
)
def eliminar_categoria(categoria_id: CategoriaId, _: AdminDep, service: ServiceDep) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _http(e)
