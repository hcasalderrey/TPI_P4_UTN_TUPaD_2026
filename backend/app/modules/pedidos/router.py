from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario

from .schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(session_factory))


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
UserDep = Annotated[Usuario, Depends(get_current_active_user)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
PedidoId = Annotated[int, Path(ge=1, description="Id del pedido")]


def _http(e: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a HTTP: 404, 403 o 400 (reglas de negocio)."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


_ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un pedido desde el carrito (RN-01)",
    description=(
        "Transaccional: valida, descuenta el stock y crea las líneas con la copia del nombre y "
        "del precio; si algo falla no se persiste nada. 404: producto inexistente o inactivo. "
        "400: stock insuficiente, producto no disponible o repetido."
    ),
    responses={404: {"description": "Producto inexistente o inactivo"},
               400: {"description": "Stock insuficiente, producto no disponible o repetido"}},
)
def crear_pedido(data: PedidoCreate, usuario: UserDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(data, usuario.id)  # type: ignore[arg-type]
    except _ERRORES as e:
        raise _http(e)


@router.get(
    "",
    response_model=PedidosPaginados,
    summary="Listar pedidos (propios, o todos si es admin)",
)
def listar_pedidos(
    usuario: UserDep,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Annotated[Optional[EstadoPedido], Query()] = None,
) -> PedidosPaginados:
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id}: si no, "resumen" se interpretaría como un id.
@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel (admin)")
def resumen_pedidos(_: AdminDep, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    summary="Detalle con sus líneas (dueño o admin)",
    responses={404: {"description": "El pedido no existe"}, 403: {"description": "Pedido de otro usuario"}},
)
def obtener_pedido(pedido_id: PedidoId, usuario: UserDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except _ERRORES as e:
        raise _http(e)


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    summary="Avanzar o cancelar según la máquina de estados (admin)",
    description="RN-02 y RN-03. 400 si la transición es inválida; cancelar restituye el stock.",
    responses={404: {"description": "El pedido no existe"}, 400: {"description": "Transición inválida"}},
)
def cambiar_estado(
    pedido_id: PedidoId, data: CambioEstado, _: AdminDep, service: ServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except _ERRORES as e:
        raise _http(e)


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    summary="Cancelar un pedido propio en PENDIENTE (dueño)",
    description="RN-03 y RN-04. 404 inexistente; 403 pedido ajeno; 400 si no está en PENDIENTE.",
    responses={404: {"description": "El pedido no existe"}, 403: {"description": "Pedido ajeno"},
               400: {"description": "No está en PENDIENTE"}},
)
def cancelar_pedido(pedido_id: PedidoId, usuario: UserDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except _ERRORES as e:
        raise _http(e)
