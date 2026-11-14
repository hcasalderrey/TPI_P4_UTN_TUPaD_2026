"""Reglas de usuarios. En este módulo se admite lanzar HTTPException desde el Service."""

from fastapi import HTTPException, status

from .models import Usuario
from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: responde 200 aunque el usuario ya estuviera activo."""
        with self.uow as uow:
            usuario = self._usuario(uow, usuario_id)
            usuario.disabled = False
            uow.session.flush()
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        """Idempotente. Un administrador no puede desactivarse a sí mismo."""
        if usuario_id == actor_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Un administrador no puede desactivarse a sí mismo"
            )
        with self.uow as uow:
            usuario = self._usuario(uow, usuario_id)
            usuario.disabled = True
            uow.session.flush()
            return UserPublic.model_validate(usuario)

    @staticmethod
    def _usuario(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"El usuario {usuario_id} no existe")
        return usuario
