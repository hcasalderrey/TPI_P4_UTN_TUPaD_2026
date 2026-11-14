from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.core.database import session_factory
from app.core.deps import require_role

from .models import Usuario
from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork(session_factory))


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
UsuarioId = Annotated[int, Path(ge=1, description="Id del usuario")]


@router.get("", response_model=list[UserPublic], summary="Listar usuarios")
def listar_usuarios(_: AdminDep, service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
    summary="Activar un usuario (disabled = false)",
    description="Idempotente: responde 200 aunque el usuario ya estuviera activo. 404 si no existe.",
)
def activar_usuario(usuario_id: UsuarioId, _: AdminDep, service: ServiceDep) -> UserPublic:
    return service.activar(usuario_id)


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    summary="Desactivar un usuario (disabled = true)",
    description=(
        "Idempotente. 404 si no existe; 400 si el administrador intenta desactivarse a sí mismo."
    ),
)
def desactivar_usuario(usuario_id: UsuarioId, admin: AdminDep, service: ServiceDep) -> UserPublic:
    return service.desactivar(usuario_id, admin.id)  # type: ignore[arg-type]
